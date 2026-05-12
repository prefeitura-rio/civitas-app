import { api } from '@/lib/api'

import type { TicketAttachmentOut } from './ticket-attachments'

export async function getTicketServicoAnexos(
  ticketId: string,
  serviceType: string,
  serviceId: string,
) {
  const { data } = await api.get<TicketAttachmentOut[]>(
    `/tickets/${encodeURIComponent(ticketId)}/servicos/${encodeURIComponent(serviceType)}/${encodeURIComponent(serviceId)}/anexos`,
  )
  return data ?? []
}
