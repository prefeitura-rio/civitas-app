import type { RawAxiosResponseHeaders } from 'axios'

import { api } from '@/lib/api'

export type TicketRelatorioCompletoPayload = {
  blob: Blob
  contentType: string
}

/** Query params do GET `/tickets/{id}/relatorio-completo` — quais seções incluir no PDF. */
export type TicketRelatorioCompletoTopics = {
  t1: boolean
  t2: boolean
  t3: boolean
  t4: boolean
  t5: boolean
  t6: boolean
  t7: boolean
}

export function defaultTicketRelatorioCompletoTopics(): TicketRelatorioCompletoTopics {
  return {
    t1: true,
    t2: true,
    t3: true,
    t4: true,
    t5: true,
    t6: true,
    t7: true,
  }
}

function headerContentType(headers: RawAxiosResponseHeaders): string {
  const raw = headers['content-type']
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split(';')[0]?.trim() || 'application/octet-stream'
  }
  return 'application/octet-stream'
}

/** GET `/tickets/{id}/relatorio-completo` — PDF com dados completos do chamado. */
export async function getTicketRelatorioCompleto(
  ticketId: string,
  topics: TicketRelatorioCompletoTopics,
): Promise<TicketRelatorioCompletoPayload> {
  const response = await api.get<Blob>(
    `/tickets/${encodeURIComponent(ticketId)}/relatorio-completo`,
    { responseType: 'blob', params: topics },
  )
  const fromHeader = headerContentType(
    response.headers as RawAxiosResponseHeaders,
  )
  const blob = response.data
  const contentType = blob.type && blob.type.length > 0 ? blob.type : fromHeader
  return { blob, contentType }
}
