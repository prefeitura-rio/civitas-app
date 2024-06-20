import axios from 'axios'

import { config } from '@/config'
// import { env } from '@/env'

export const isApiError = axios.isAxiosError

export const api = axios.create({
  baseURL: config.apiUrl,
  // withCredentials: true,
})

api.interceptors.request.use((config) => {
  // Try to get token from session storage
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
