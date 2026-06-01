import { api } from '@/lib/api'

import type { TicketAttachmentOut } from './ticket-attachments'

export async function getTicketServicoAnexos(
  ticketId: string,
  serviceType: string,
  serviceId: string,
) {
  const { data } = await api.get<TicketAttachmentOut[]>(
    `/tickets/${encodeURIComponent(ticketId)}/services/${encodeURIComponent(serviceType)}/${encodeURIComponent(serviceId)}/attachments`,
  )
  return data ?? []
}
