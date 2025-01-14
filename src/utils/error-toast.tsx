'use client'

import { deleteCookie, getCookie } from 'cookies-next'
import { toast } from 'sonner'

import {
  GRANT_ERROR_TOAST_COOKIE_KEY,
  TOO_MANY_REQUESTS_ERROR_TOAST_COOKIE_KEY,
} from '@/lib/api'

export function ErrorToast() {
  const tooManyRequestsToast = getCookie(
    TOO_MANY_REQUESTS_ERROR_TOAST_COOKIE_KEY,
  )
  if (tooManyRequestsToast) {
    deleteCookie(TOO_MANY_REQUESTS_ERROR_TOAST_COOKIE_KEY)
    toast.error(tooManyRequestsToast)
  }

  const grantErrorToast = getCookie(GRANT_ERROR_TOAST_COOKIE_KEY)
  if (grantErrorToast) {
    deleteCookie(GRANT_ERROR_TOAST_COOKIE_KEY)
    toast.error(grantErrorToast, { duration: Infinity, id: 'expired_token' })
  }

  return null
}
