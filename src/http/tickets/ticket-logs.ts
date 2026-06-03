import { api } from '@/lib/api'

/** GET `/tickets/{id}/logs` — `TicketLogListItemOut` (civitas-api). */
export type TicketLogListItemOut = {
  id: string
  ticket_id: string
  created_at: string
  author_id?: string | null
  author_name?: string | null
  author_roles: string[]
  action: string
}

export async function getTicketLogs(
  ticketId: string,
): Promise<TicketLogListItemOut[]> {
  const { data } = await api.get<TicketLogListItemOut[]>(
    `/tickets/${encodeURIComponent(ticketId)}/logs`,
  )
  return Array.isArray(data) ? data : []
}
