import { api } from '@/lib/api'

import { type EmailOut } from './get-email'

export function markEmailAsSpam(emailId: string) {
  return api.patch<EmailOut>(`/emails/${encodeURIComponent(emailId)}/spam`)
}
