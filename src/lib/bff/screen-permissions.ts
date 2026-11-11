import { config } from '@/config'
import {
  canViewTicketScreen,
  TICKET_MODULE_PERMISSIONS_PATH,
  type TicketModulePermissionsMeOut,
} from '@/http/tickets/ticket-module-permissions-me'

import type { BffSession } from './create-proxy-handler'

/**
 * Permissões de tela do usuário da sessão, lidas no civitas-api pelo servidor (BFF e layouts). Não usa o cookie
 * `ticket_module_permissions`: ele é gravado no login, então não reflete permissões dadas depois, e o navegador pode
 * alterá-lo.
 */
export type ScreenPermissionsResult =
  | { status: 'ok'; permissions: TicketModulePermissionsMeOut }
  | { status: 'unauthorized' }
  | { status: 'error' }

const CACHE_TTL_MS = 60_000
const CACHE_MAX_ENTRIES = 2_000
// Sem resposta do civitas-api nesse prazo, a consulta falha (e a tela é negada) em vez de prender a página e o BFF.
const REQUEST_TIMEOUT_MS = 10_000

const cache = new Map<
  string,
  { expiresAt: number; permissions: TicketModulePermissionsMeOut }
>()

// Consultas em andamento por sessão: as chamadas paralelas da mesma tela (cache vazio) esperam a mesma resposta em
// vez de cada uma consultar o civitas-api.
const inFlight = new Map<string, Promise<ScreenPermissionsResult>>()

function pruneCache(nowMs: number) {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= nowMs) cache.delete(key)
  }
  // Ainda cheio: descarta os mais antigos (o Map mantém a ordem de inserção).
  while (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
}

export async function fetchSessionScreenPermissions(
  session: BffSession,
): Promise<ScreenPermissionsResult> {
  const cached = cache.get(session.sessionId)
  if (cached && cached.expiresAt > Date.now()) {
    return { status: 'ok', permissions: cached.permissions }
  }

  const pending = inFlight.get(session.sessionId)
  if (pending) return pending

  const request = requestScreenPermissions(session).finally(() => {
    inFlight.delete(session.sessionId)
  })
  inFlight.set(session.sessionId, request)
  return request
}

async function requestScreenPermissions(
  session: BffSession,
): Promise<ScreenPermissionsResult> {
  try {
    const response = await fetch(
      `${config.apiUrl}/${TICKET_MODULE_PERMISSIONS_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'X-Civitas-Session-Id': session.sessionId,
          Accept: 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    )
    if (response.status === 401) return { status: 'unauthorized' }
    if (!response.ok) {
      console.error('[screen-permissions] civitas-api responded', {
        status: response.status,
      })
      return { status: 'error' }
    }
    const permissions = (await response.json()) as TicketModulePermissionsMeOut
    const nowMs = Date.now()
    pruneCache(nowMs)
    cache.set(session.sessionId, {
      expiresAt: nowMs + CACHE_TTL_MS,
      permissions,
    })
    return { status: 'ok', permissions }
  } catch (error) {
    console.error('[screen-permissions] request failed', error)
    return { status: 'error' }
  }
}

/**
 * Resultado da checagem de uma tela:
 * - `allowed`: o civitas-api confirmou a permissão;
 * - `forbidden`: sem a permissão, ou a consulta falhou (falha nega);
 * - `unauthorized`: o civitas-api recusou a sessão (ex.: outro login a substituiu). Como no BFF principal, a sessão
 *   do CIVITAS acabou e o usuário volta ao login.
 */
export type ScreenAccess = 'allowed' | 'forbidden' | 'unauthorized'

export async function checkSessionScreenAccess(
  session: BffSession,
  screenCode: string,
): Promise<ScreenAccess> {
  const result = await fetchSessionScreenPermissions(session)
  if (result.status === 'unauthorized') return 'unauthorized'
  return result.status === 'ok' &&
    canViewTicketScreen(result.permissions, screenCode)
    ? 'allowed'
    : 'forbidden'
}

/** Só para testes. */
export function clearScreenPermissionsCache() {
  cache.clear()
  inFlight.clear()
}
