import { isApiError } from '@/lib/api'

export function isValidationError(error: unknown) {
  return (
    isApiError(error) &&
    error.response?.status === 400 &&
    error.response?.data?.error === 'invalid_grant'
  )
}
