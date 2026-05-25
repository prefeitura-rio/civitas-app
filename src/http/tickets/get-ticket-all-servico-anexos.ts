import { api } from '@/lib/api'

import type { TicketAttachmentWithPlaybackOut } from './ticket-resposta'

export async function getTicketAllServicoAnexos(ticketId: string) {
  const { data } = await api.get<TicketAttachmentWithPlaybackOut[]>(
    `/tickets/${encodeURIComponent(ticketId)}/servicos/anexos`,
  )
  return data ?? []
}
