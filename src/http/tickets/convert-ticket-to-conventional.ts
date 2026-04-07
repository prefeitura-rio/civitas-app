import { api } from '@/lib/api'

export async function convertTicketToConventional(
  ticketId: string,
  files: File[] = [],
  options?: { emailId?: string | null },
) {
  const form = new FormData()
  for (const f of files) {
    form.append('files', f)
  }

  const emailId = options?.emailId?.trim()
  const path = emailId
    ? `/tickets/${ticketId}/convert-to-conventional?email_id=${encodeURIComponent(emailId)}`
    : `/tickets/${ticketId}/convert-to-conventional`

  const response = await api.post(path, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response
}
