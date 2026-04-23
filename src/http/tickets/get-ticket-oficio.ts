import type { RawAxiosResponseHeaders } from 'axios'

import { api } from '@/lib/api'

export type TicketOficioPayload = {
  blob: Blob
  contentType: string
}

function headerContentType(headers: RawAxiosResponseHeaders): string {
  const raw = headers['content-type']
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split(';')[0]?.trim() || 'application/octet-stream'
  }
  return 'application/octet-stream'
}

export async function getTicketOficio(
  ticketId: string,
): Promise<TicketOficioPayload> {
  const response = await api.get<Blob>(
    `/tickets/${encodeURIComponent(ticketId)}/oficio`,
    { responseType: 'blob' },
  )
  const fromHeader = headerContentType(
    response.headers as RawAxiosResponseHeaders,
  )
  const blob = response.data
  const contentType = blob.type && blob.type.length > 0 ? blob.type : fromHeader
  return { blob, contentType }
}
