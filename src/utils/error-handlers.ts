import { isApiError } from '@/lib/api'

function messageFromDetail(detail: unknown): string | null {
  if (typeof detail === 'string') {
    const t = detail.trim()
    return t.length > 0 ? t : null
  }
  if (
    detail &&
    typeof detail === 'object' &&
    'mensagem' in detail &&
    typeof (detail as { mensagem: unknown }).mensagem === 'string'
  ) {
    const t = (detail as { mensagem: string }).mensagem.trim()
    return t.length > 0 ? t : null
  }
  return null
}

export function getApiErrorMessage(error: unknown): string {
  if (!isApiError(error)) return genericErrorMessage
  if (error.response?.status === 500) return genericErrorMessage
  const fromDetail = messageFromDetail(error.response?.data?.detail)
  if (fromDetail) return fromDetail
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
