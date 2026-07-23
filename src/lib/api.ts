import axios from 'axios'
import { deleteCookie, getCookie } from 'cookies-next'
import { CookiesFn } from 'cookies-next/lib/types'

import { config as appConfig } from '@/config'
import { TICKET_MODULE_PERMISSIONS_COOKIE } from '@/http/tickets/ticket-module-permissions-me'
import { getChamadosImpersonateUserId } from '@/lib/chamados-impersonation-storage'

import { queryClient } from './react-query'

export const isApiError = axios.isAxiosError

const isServer = typeof window === 'undefined'

export const api = axios.create({
  baseURL: isServer ? appConfig.apiUrl : '/api/bff',
})

api.interceptors.request.use(async (requestConfig) => {
  // Try to get token from cookies
  let cookieStore: CookiesFn | undefined

  if (isServer) {
    const { cookies: serverCookies } = await import('next/headers')

    cookieStore = serverCookies
  }
  const token = getCookie('token', { cookies: cookieStore })
  const sessionId = getCookie('session_id', { cookies: cookieStore })

  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`
  }
  if (sessionId) {
    requestConfig.headers['X-Civitas-Session-Id'] = sessionId
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

    if (typeof window !== 'undefined' && status === 401) {
      const errorCode = error?.response?.data?.code
      deleteCookie('token')
      deleteCookie('session_id')
      deleteCookie(TICKET_MODULE_PERMISSIONS_COOKIE)
      queryClient.clear()
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      if (window.location.pathname !== '/auth/sign-in') {
        if (errorCode === 'session_invalidated') {
          sessionStorage.setItem('session-invalidated-toast', '1')
        }

        window.location.href = '/auth/sign-in'
      }
    }

    if (typeof window !== 'undefined' && status === 403) {
      if (window.location.pathname !== '/forbidden') {
        window.location.href = '/forbidden'
      }
    }

    return Promise.reject(error)
  },
)
