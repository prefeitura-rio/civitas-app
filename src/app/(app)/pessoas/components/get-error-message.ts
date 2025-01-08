import { isAxiosError } from 'axios'

import { GENERIC_ERROR_MESSAGE } from '@/utils/others/error-handlers'

export function getErrorMessage(
  error: Error,
  notFoundMessage = 'resultado não encontrado',
) {
  if (isAxiosError(error)) {
    if (
      error.response?.data?.detail ===
      'Something unexpected happened to Cortex API'
    ) {
      return 'Um erro inesperado aconteceu na API do Córtex. Se o erro persistir, por favor, contate um administrador do sistema.'
    }

    if (error.response?.status === 451) {
      return 'Seu CPF pode ter sido bloqueado pelo Ministério da Justiça por questões de segurança. Por favor, contate um administrador do sistema para mais informações.'
    }

    if (error.response?.status === 429) {
      return 'Você atingiu o limite de requisições à API do Córtex. Por favor, tente novamente mais tarde.'
    }

    if (error.response?.status === 404) {
      return notFoundMessage
    }

    return GENERIC_ERROR_MESSAGE
  }
  return GENERIC_ERROR_MESSAGE
}
