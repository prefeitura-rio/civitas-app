import { api } from '@/lib/api'

export type TicketHeaderOut = {
  internal_number: string

  status: string

  ticket_type_name?: string | null

  priority?: string | null

  base_date?: string | null

  team?: string | null

  created_at: string

  assignee?: string | null

  open_duration: string
}

/** @deprecated Use TicketHeaderOut */

export type TicketCabecalhoOut = TicketHeaderOut

export async function getTicketCabecalho(ticketId: string) {
  const { data } = await api.get<TicketHeaderOut>(`/tickets/${ticketId}/header`)

  return data
}

export { getTicketCabecalho as getTicketHeader }
