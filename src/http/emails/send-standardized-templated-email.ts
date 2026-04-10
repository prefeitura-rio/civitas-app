import { api } from '@/lib/api'

export interface EmailStandardizedTemplateSendIn {
  email_id: string
  title: string
  body: string
}

export interface EmailSendOut {
  id?: string
}

export function sendStandardizedTemplatedEmail(
  payload: EmailStandardizedTemplateSendIn,
) {
  return api.post<EmailSendOut>('emails/enviar/resposta-padronizada', payload)
}
