import { isApiError } from '@/lib/api'
import { genericErrorMessage } from '@/utils/error-handlers'

export function getGcsUploadErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    if (error instanceof Error) {
      return error.message
    }
    return genericErrorMessage
  }

  const status = error.response?.status

  if (status === 404) {
    return 'Bucket não encontrado. Verifique se o nome do bucket está correto.'
  }

  if (status === 403) {
    return 'Você não tem permissão para fazer upload neste bucket.'
  }

  if (status === 400) {
    const detail = error.response?.data?.detail || error.response?.data?.message
    if (detail) {
      return detail
    }
    return 'Dados inválidos. Verifique os campos preenchidos.'
  }

  if (status === 500) {
    return 'Erro interno do servidor. Tente novamente mais tarde.'
  }

  if (status === 503) {
    return 'Serviço temporariamente indisponível. Tente novamente mais tarde.'
  }

  return genericErrorMessage
}
