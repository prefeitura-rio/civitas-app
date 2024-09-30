import { isApiError } from '@/lib/api'

export function isGrantError(error: unknown) {
  return (
    isApiError(error) &&
    error.response?.status === 400 &&
    error.response?.data?.error === 'invalid_grant'
  )
}

export function isNotFoundError(error: unknown) {
  return isApiError(error) && error.response?.status === 404
}

export const genericErrorMessage =
  'Um erro inexperado ocorreu. Se o erro persistir, por favor, contate um administrador do sistema.'

export function isValidationError(error: unknown) {
  return isApiError(error) && error.response?.status === 422
}

export function isConflictError(error: unknown) {
  return isApiError(error) && error.response?.status === 409
}
