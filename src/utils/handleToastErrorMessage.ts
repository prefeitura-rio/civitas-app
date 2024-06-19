import { toast } from 'sonner'

import { isValidationError } from './isValidationError'

export function handleToastErrorMessage(error: unknown) {
  if (isValidationError(error)) {
    toast.error('Credenciais inválidas.')
  } else {
    toast.error(
      'Um erro inexperado ocorreu! Se o erro persistir, por favor, contate o administrador do sistema',
    )
  }
}
