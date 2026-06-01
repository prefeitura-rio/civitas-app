import { api } from '@/lib/api'

export type TicketServicoIndiceItem = {
  index: number
  label: string
  service_type: string
  service_id: string
}

export async function getTicketServicosIndice(ticketId: string) {
  const { data } = await api.get<TicketServicoIndiceItem[]>(
    `/tickets/${encodeURIComponent(ticketId)}/services/index`,
  )
  return data ?? []
}
