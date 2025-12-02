import { isApiError } from '@/lib/api'
import { genericErrorMessage } from '@/utils/error-handlers'

export function getGcsErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return genericErrorMessage
  }

  const status = error.response?.status

  if (status === 404) {
    return 'Arquivo ou bucket não encontrado. Verifique se o nome do arquivo e do bucket estão corretos.'
  }

  if (status === 403) {
    return 'Você não tem permissão para acessar este arquivo ou bucket.'
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
