import axios from 'axios'
import { getCookie } from 'cookies-next'
import { CookiesFn } from 'cookies-next/lib/types'

import {
  getSessionCookieName,
  getSessionIdFromValidSession,
} from '@/auth/session'
import { config as appConfig } from '@/config'
import { shouldEndSession } from '@/lib/auth-session-end'
import { getChamadosImpersonateUserId } from '@/lib/chamados-impersonation-storage'

import { redirectToSignIn } from './session-redirect'

export const isApiError = axios.isAxiosError

const isServer = typeof window === 'undefined'
export const api = axios.create({
  baseURL: isServer ? appConfig.apiUrl : '/api/bff',
})

api.interceptors.request.use(async (requestConfig) => {
  let cookieStore: CookiesFn | undefined

  if (isServer) {
    const { cookies: serverCookies } = await import('next/headers')
    cookieStore = serverCookies
    const sessionId = getSessionIdFromValidSession(
      serverCookies().get(getSessionCookieName())?.value,
    )

    if (sessionId) {
      requestConfig.headers['X-Civitas-Session-Id'] = sessionId
    }
  }

  const token = getCookie('token', { cookies: cookieStore })
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`
  }

  const shouldAttachImpersonation =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/demandas') &&
    requestConfig.url !== '/auth/login' &&
    requestConfig.url !== '/auth/refresh'

  if (shouldAttachImpersonation && appConfig.enableImpersonation) {
    const impersonateUserId = getChamadosImpersonateUserId()
    if (impersonateUserId?.trim()) {
      requestConfig.params = {
        ...(requestConfig.params ?? {}),
        impersonate_user_id: impersonateUserId,
      }
    }
  }

  return requestConfig
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status

    const errorCode = error?.response?.data?.code

    // 401 ou 403 `user_deactivated`: encerra o login (não é só falta de permissão).
    if (typeof window !== 'undefined' && shouldEndSession(status, errorCode)) {
      if (window.location.pathname !== '/auth/sign-in') {
        redirectToSignIn(errorCode)

        return new Promise(() => {
          // Keep callers from rendering transient query/error states while the
          // browser is being redirected to sign-in.
        })
      }
    }

    if (
      typeof window !== 'undefined' &&
      status === 403 &&
      !shouldEndSession(status, errorCode)
    ) {
      if (window.location.pathname !== '/forbidden') {
        window.location.href = '/forbidden'
      }
    }

    return Promise.reject(error)
  },
)
