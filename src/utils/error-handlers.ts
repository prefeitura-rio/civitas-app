import { isApiError } from '@/lib/api'

/** Para erros de API com status !== 500, retorna response.data.detail; caso contrário, mensagem genérica. */
export function getApiErrorMessage(error: unknown): string {
  if (!isApiError(error)) return genericErrorMessage
  if (error.response?.status === 500) return genericErrorMessage
  const detail = error.response?.data?.detail
  if (typeof detail === 'string' && detail.trim()) return detail
  return genericErrorMessage
}

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
