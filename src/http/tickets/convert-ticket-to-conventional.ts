import { api } from '@/lib/api'

export async function convertTicketToConventional(
  ticketId: string,
  payload: unknown,
  files: File[] = [],
) {
  const form = new FormData()
  form.append('payload', JSON.stringify(payload))

  for (const f of files) {
    form.append('files', f)
  }

  const response = await api.post(
    `/tickets/${ticketId}/convert-to-conventional`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return response
}
