import type { RawAxiosResponseHeaders } from 'axios'

import { api } from '@/lib/api'

export type TicketShiftClosingReportPayload = {
  blob: Blob
  contentType: string
  filename: string
}

function headerContentType(headers: RawAxiosResponseHeaders): string {
  const raw = headers['content-type']
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split(';')[0]?.trim() || 'application/octet-stream'
  }
  return 'application/octet-stream'
}

function parseFilenameFromDisposition(
  disposition: string | undefined,
  fallback: string,
): string {
  if (!disposition?.includes('filename=')) return fallback
  const match = disposition.match(/filename="?([^"]+)"?/)
  return match?.[1]?.trim() || fallback
}

/** GET `/tickets/shift-closings/{id}/report` — PDF do fechamento de turno. */
export async function getTicketShiftClosingReport(
  shiftClosingId: string,
): Promise<TicketShiftClosingReportPayload> {
  const response = await api.get<Blob>(
    `/tickets/shift-closings/${encodeURIComponent(shiftClosingId)}/report`,
    { responseType: 'blob' },
  )
  const headers = response.headers as RawAxiosResponseHeaders
  const fromHeader = headerContentType(headers)
  const blob = response.data
  const contentType = blob.type && blob.type.length > 0 ? blob.type : fromHeader
  const disposition = headers['content-disposition']
  const dispositionStr =
    typeof disposition === 'string' ? disposition : undefined
  const filename = parseFilenameFromDisposition(
    dispositionStr,
    'relatorio-fechamento-turno.pdf',
  )
  return { blob, contentType, filename }
}
