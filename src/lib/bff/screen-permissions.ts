import { config } from '@/config'
import {
  canViewTicketScreen,
  TICKET_MODULE_PERMISSIONS_PATH,
  type TicketModulePermissionsMeOut,
} from '@/http/tickets/ticket-module-permissions-me'
import {
  readResponseErrorCode,
  USER_DEACTIVATED_CODE,
} from '@/lib/auth-session-end'

import type { BffSession } from './create-proxy-handler'

/**
 * Permissões de tela do usuário da sessão, lidas no civitas-api pelo servidor (BFF e layouts). Não usa o cookie
 * `ticket_module_permissions`: ele é gravado no login, então não reflete permissões dadas depois, e o navegador pode
 * alterá-lo.
 */
export type ScreenPermissionsResult =
  | { status: 'ok'; permissions: TicketModulePermissionsMeOut }
  | { status: 'unauthorized'; code?: string }
  | { status: 'error' }

// Sem resposta do civitas-api nesse prazo, a consulta falha (e a tela é negada) em vez de prender a página e o BFF.
const REQUEST_TIMEOUT_MS = 10_000

// Sem cache entre chamadas: cada chamada confere a sessão no civitas-api, então um usuário desativado perde o acesso
// na hora, em qualquer instância do Next. Só as chamadas simultâneas da mesma sessão (ex.: os tiles de um mapa)
// compartilham a consulta em andamento.
const inFlight = new Map<string, Promise<ScreenPermissionsResult>>()

export async function fetchSessionScreenPermissions(
  session: BffSession,
): Promise<ScreenPermissionsResult> {
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
    if (response.status === 403) {
      // Usuário desativado na CIVITAS: a sessão acabou (não é falta de permissão da tela).
      if ((await readResponseErrorCode(response)) === USER_DEACTIVATED_CODE) {
        return { status: 'unauthorized', code: USER_DEACTIVATED_CODE }
      }
    }
    if (!response.ok) {
      console.error('[screen-permissions] civitas-api responded', {
        status: response.status,
      })
      return { status: 'error' }
    }
    const permissions = (await response.json()) as TicketModulePermissionsMeOut
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
export type ScreenAccess =
  | { access: 'allowed' | 'forbidden' }
  | { access: 'unauthorized'; code?: string }

export async function checkSessionScreenAccess(
  session: BffSession,
  screenCode: string,
): Promise<ScreenAccess> {
  const result = await fetchSessionScreenPermissions(session)
  if (result.status === 'unauthorized') {
    return { access: 'unauthorized', code: result.code }
  }
  return {
    access:
      result.status === 'ok' &&
      canViewTicketScreen(result.permissions, screenCode)
        ? 'allowed'
        : 'forbidden',
  }
}
