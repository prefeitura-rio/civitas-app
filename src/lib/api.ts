import axios from 'axios'
import { deleteCookie, getCookie } from 'cookies-next'
import { CookiesFn } from 'cookies-next/lib/types'

import { config } from '@/config'

import { queryClient } from './react-query'

export const isApiError = axios.isAxiosError

export const api = axios.create({
  baseURL: config.apiUrl,
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
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      deleteCookie('token')
      queryClient.clear()
      window.location.href = '/auth/sign-in'
    }
    return Promise.reject(error)
  },
)
