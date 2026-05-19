import { api } from '@/lib/api'

export type TicketReassignPriority = 'URGENTE' | 'ALTA' | 'ROTINA'

export type TicketReassignIn = {
  equipe_id: string
  responsavel_ids: string[]
  prioridade?: TicketReassignPriority | null
  comentario?: string | null
}

export type TicketReassignOut = {
  ticket_id: string
  equipe_id: string
  responsavel_ids: string[]
}

/** POST `/tickets/{ticket_id}/reatribuir` */
export async function reassignTicket(
  ticketId: string,
  payload: TicketReassignIn,
) {
  const { data } = await api.post<TicketReassignOut>(
    `/tickets/${encodeURIComponent(ticketId)}/reatribuir`,
    payload,
  )
  return data
}
