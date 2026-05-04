import axios from 'axios'
import { deleteCookie, getCookie } from 'cookies-next'
import { CookiesFn } from 'cookies-next/lib/types'

import { config as appConfig } from '@/config'
import { TICKET_MODULE_PERMISSIONS_COOKIE } from '@/http/tickets/ticket-module-permissions-me'
import { getChamadosImpersonateUserId } from '@/lib/chamados-impersonation-storage'

import { queryClient } from './react-query'

export const isApiError = axios.isAxiosError

export const api = axios.create({
  baseURL: appConfig.apiUrl,
})

api.interceptors.request.use(async (config) => {
  // Try to get token from cookies
  let cookieStore: CookiesFn | undefined

  if (typeof window === 'undefined') {
    const { cookies: serverCookies } = await import('next/headers')

    cookieStore = serverCookies
  }
  const token = getCookie('token', { cookies: cookieStore })

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    // config.headers['Content-Type'] = 'application/json'
  }

  const shouldAttachImpersonation =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/chamados') &&
    config.url !== '/auth/login' &&
    config.url !== '/auth/refresh'

  if (shouldAttachImpersonation && appConfig.enableImpersonation) {
    const impersonateUserId = getChamadosImpersonateUserId()
    if (impersonateUserId?.trim()) {
      config.params = {
        ...(config.params ?? {}),
        impersonate_user_id: impersonateUserId,
      }
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (typeof window !== 'undefined' && status === 401) {
      deleteCookie('token')
      deleteCookie(TICKET_MODULE_PERMISSIONS_COOKIE)
      queryClient.clear()
      if (window.location.pathname !== '/auth/sign-in') {
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
