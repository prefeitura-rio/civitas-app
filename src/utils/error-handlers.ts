import { isAxiosError } from 'axios'

export const GENERIC_ERROR_MESSAGE =
  'Um erro inesperado ocorreu! Se o erro persistir, por favor, contate um administrador do sistema.'

export function isGrantError(error: unknown) {
  return (
    isAxiosError(error) &&
    error.response?.status === 400 &&
    error.response?.data?.error === 'invalid_grant'
  )
}

export function isUnauthorizedError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 401
}

export function isForbiddenError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 403
}

export function isNotFoundError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 404
}

export function isConflictError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 409
}

export function isValidationError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 422
}

export function isTooManyRequests(error: unknown) {
  return isAxiosError(error) && error.response?.status === 429
}
