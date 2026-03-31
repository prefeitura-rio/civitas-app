import { api } from '@/lib/api'

export async function convertTicketToConventional(ticketId: string) {
  const response = await api.post(
    `/tickets/${ticketId}/convert-to-conventional`,
  )
  return response
}
