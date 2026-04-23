import type { TicketOut } from '@/http/tickets/get-ticket-by-id'
import { api } from '@/lib/api'

/** POST `/tickets/{id}/finalizar` — resposta `TicketOut` (API). */
export async function finalizeTicket(ticketId: string) {
  const { data } = await api.post<TicketOut>(
    `/tickets/${encodeURIComponent(ticketId)}/finalizar`,
  )
  return data
}
