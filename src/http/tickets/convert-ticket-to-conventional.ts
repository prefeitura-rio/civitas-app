import { api } from '@/lib/api'

export async function convertTicketToConventional(
  ticketId: string,
  files: File[] = [],
) {
  const form = new FormData()
  for (const f of files) {
    form.append('files', f)
  }

  const response = await api.post(
    `/tickets/${ticketId}/convert-to-conventional`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response
}
