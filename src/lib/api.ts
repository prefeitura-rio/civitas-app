import axios from 'axios'
import { getCookie } from 'cookies-next'
import { CookiesFn } from 'cookies-next/lib/types'

import { config } from '@/config'

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
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log(error)
      console.log({ response: error.response })
      console.log({ status: error.response.status })
      window.location.href = '/api/auth/sign-out'
    }
    return Promise.reject(error)
  },
)
