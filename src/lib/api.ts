import axios from 'axios'
import {
  type CookiesFn,
  deleteCookie,
  getCookie,
  setCookie,
} from 'cookies-next'
import { redirect } from 'next/navigation'

import { env } from '@/env/client'
import { isTooManyRequests, isUnauthorizedError } from '@/utils/error-handlers'

export const COOKIES_PREFIX = '@ed-rio:civitas:'
export const ACCESS_TOKEN_COOKIE = `${COOKIES_PREFIX}access_token`
export const ACCESS_TOKEN_EXPIRATION_DATE_COOKIE = `${COOKIES_PREFIX}access_token_expiration_date`
export const TOO_MANY_REQUESTS_ERROR_TOAST_LOCAL_STORAGE_KEY = `${COOKIES_PREFIX}too_many_requests_error_toast`
export const GRANT_ERROR_TOAST_LOCAL_STORAGE_KEY = `${COOKIES_PREFIX}grant_error`

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_CIVITAS_API_URL,
})

api.interceptors.request.use(async (config) => {
  let cookieStore: CookiesFn | undefined

  if (typeof window === 'undefined') {
    const { cookies: serverCookies } = await import('next/headers')

    cookieStore = serverCookies
  }

  const token = await getCookie(ACCESS_TOKEN_COOKIE, { cookies: cookieStore })

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    config.headers['Content-Type'] = 'application/json'
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    let cookieStore: CookiesFn | undefined

    if (typeof window === 'undefined') {
      const { cookies: serverCookies } = await import('next/headers')

      cookieStore = serverCookies
    }

    if (isUnauthorizedError(error)) {
      deleteCookie(ACCESS_TOKEN_COOKIE, { cookies: cookieStore })
      deleteCookie(ACCESS_TOKEN_EXPIRATION_DATE_COOKIE, {
        cookies: cookieStore,
      })

      setCookie(
        GRANT_ERROR_TOAST_LOCAL_STORAGE_KEY,
        'Sua sessão expirou. Por favor, faça login novamente.',
        { cookies: cookieStore },
      )
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/auth/sign-in'
      } else {
        redirect('/auth/sign-in')
      }
    }

    if (isTooManyRequests(error)) {
      setCookie(
        TOO_MANY_REQUESTS_ERROR_TOAST_LOCAL_STORAGE_KEY,
        'Você realizou muitas requisições em um curto espaço de tempo. Aguarde alguns segundos e tente novamente.',
        { cookies: cookieStore },
      )
      const currentPath = window.location.pathname
      if (currentPath !== '/') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  },
)
