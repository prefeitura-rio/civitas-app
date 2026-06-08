import { api } from '@/lib/api'

export async function createTicket(payload: unknown, files: File[] = []) {
  const form = new FormData()
  form.append('payload', JSON.stringify(payload))

  for (const f of files) {
    form.append('files', f)
  }

  const response = await api.post('/tickets', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response
}
