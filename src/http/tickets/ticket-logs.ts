import { api } from '@/lib/api'

/** GET `/tickets/{id}/logs` — `TicketLogListItemOut` (civitas-api). */
export type TicketLogListItemOut = {
  id: string
  chamado_id: string
  criado_em: string
  autor_id?: string | null
  autor_nome?: string | null
  autor_papeis: string[]
  acao: string
}

export async function getTicketLogs(
  ticketId: string,
): Promise<TicketLogListItemOut[]> {
  const { data } = await api.get<TicketLogListItemOut[]>(
    `/tickets/${encodeURIComponent(ticketId)}/logs`,
  )
  return Array.isArray(data) ? data : []
}
