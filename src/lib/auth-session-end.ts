/**
 * Fim de sessão vindo do civitas-api: 401 (sessão inválida) ou 403 `user_deactivated` (usuário desativado na
 * CIVITAS). Os dois encerram o login; o motivo vira um aviso na tela de login.
 */
export const USER_DEACTIVATED_CODE = 'user_deactivated'

/**
 * Marca que o BFF põe nos 401 que ELE gera por sessão encerrada. Um 401 repassado de um serviço externo (ex.: o
 * veicular, que não derruba a sessão) vem sem ela; o cliente só desloga com a marca.
 */
export const SESSION_ENDED_HEADER = 'x-civitas-session-ended'
export const SESSION_INVALIDATED_CODE = 'session_invalidated'

export type SessionEndNotice =
  | typeof SESSION_INVALIDATED_CODE
  | typeof USER_DEACTIVATED_CODE

const NOTICE_KEYS: Record<SessionEndNotice, string> = {
  session_invalidated: 'session-invalidated-toast',
  user_deactivated: 'user-deactivated-toast',
}

export const USER_DEACTIVATED_MESSAGE =
  'Seu acesso foi desativado. Procure a coordenação.'

export function isUserDeactivated(status: number | undefined, code?: string) {
  return status === 403 && code === USER_DEACTIVATED_CODE
}

export function shouldEndSession(status: number | undefined, code?: string) {
  return status === 401 || isUserDeactivated(status, code)
}

export function markSessionEndNotice(code: string | undefined) {
  if (code !== SESSION_INVALIDATED_CODE && code !== USER_DEACTIVATED_CODE) {
    return
  }
  try {
    sessionStorage.setItem(NOTICE_KEYS[code], '1')
  } catch {
    // Sem sessionStorage o aviso some, mas o logout continua.
  }
}

/** Devolve (e apaga) o aviso pendente; a desativação tem prioridade. */
export function consumeSessionEndNotice(): SessionEndNotice | null {
  try {
    for (const code of [
      USER_DEACTIVATED_CODE,
      SESSION_INVALIDATED_CODE,
    ] as const) {
      if (sessionStorage.getItem(NOTICE_KEYS[code]) === '1') {
        sessionStorage.removeItem(NOTICE_KEYS.user_deactivated)
        sessionStorage.removeItem(NOTICE_KEYS.session_invalidated)
        return code
      }
    }
  } catch {
    // ignore
  }
  return null
}
