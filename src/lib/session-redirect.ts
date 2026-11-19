import { deleteCookie } from 'cookies-next'

import { TICKET_MODULE_PERMISSIONS_COOKIE } from '@/http/tickets/ticket-module-permissions-me'
import { markSessionEndNotice } from '@/lib/auth-session-end'

import { queryClient } from './react-query'

let isAuthRedirecting = false

/**
 * Encerra o login no navegador e volta à tela de login, guardando o motivo (ex.: `user_deactivated`) para o aviso.
 * Usado por todo cliente HTTP que fala com um BFF: `lib/api.ts` (civitas-api) e o módulo de Inteligência Veicular.
 */
export function redirectToSignIn(errorCode?: string) {
  if (
    typeof window === 'undefined' ||
    isAuthRedirecting ||
    window.location.pathname === '/auth/sign-in'
  ) {
    return
  }

  isAuthRedirecting = true

  deleteCookie('token')
  deleteCookie(TICKET_MODULE_PERMISSIONS_COOKIE)
  queryClient.clear()

  markSessionEndNotice(errorCode)

  fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
    .catch(() => {
      // The redirect must continue even if the logout endpoint is unavailable.
    })
    .finally(() => {
      window.location.replace('/auth/sign-in')
    })
}
