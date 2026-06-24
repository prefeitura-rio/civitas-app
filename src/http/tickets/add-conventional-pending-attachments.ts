import { api } from '@/lib/api'

export async function addConventionalPendingAttachments(
  ticketId: string,
  files: File[],
  options?: { emailId?: string | null },
) {
  const form = new FormData()
  for (const f of files) {
    form.append('files', f)
  }

  const emailId = options?.emailId?.trim()
  const path = emailId
    ? `/tickets/${ticketId}/conventional-pending/attachments?email_id=${encodeURIComponent(emailId)}`
    : `/tickets/${ticketId}/conventional-pending/attachments`

  const response = await api.post(path, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response
}
