import { api } from '@/lib/api'

import { type EmailOut } from './get-email'

export function markEmailAsAguardandoResposta(emailId: string) {
  return api.patch<EmailOut>(
    `/emails/${encodeURIComponent(emailId)}/aguardando-resposta`,
  )
}
