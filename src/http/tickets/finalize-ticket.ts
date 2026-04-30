import { api } from '@/lib/api'

/** POST `/tickets/{ticket_id}/workflow/actions/FINALIZAR_CHAMADO` — resposta `true` (API). */
export async function finalizeTicket(ticketId: string) {
  const { data } = await api.post<boolean>(
    `/tickets/${encodeURIComponent(ticketId)}/workflow/actions/FINALIZAR_CHAMADO`,
  )
  return data
}
