import { api } from '@/lib/api'

export type TicketReassignPriority = 'URGENTE' | 'ALTA' | 'ROTINA'

export type TicketReassignIn = {
  team_id: string
  assignee_ids: string[]
  priority?: TicketReassignPriority | null
  comment?: string | null
}

export type TicketReassignOut = {
  ticket_id: string
  team_id: string
  assignee_ids: string[]
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
