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

const cache = new Map<
  string,
  { expiresAt: number; permissions: TicketModulePermissionsMeOut }
>()

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
  const nowMs = Date.now()
  const cached = cache.get(session.sessionId)
  if (cached && cached.expiresAt > nowMs) {
    return { status: 'ok', permissions: cached.permissions }
  }

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

/** Só `true` quando o civitas-api confirmou a permissão; falha na consulta nega. */
export async function sessionCanViewScreen(
  session: BffSession,
  screenCode: string,
): Promise<boolean> {
  const result = await fetchSessionScreenPermissions(session)
  return (
    result.status === 'ok' &&
    canViewTicketScreen(result.permissions, screenCode)
  )
}

/** Só para testes. */
export function clearScreenPermissionsCache() {
  cache.clear()
}
