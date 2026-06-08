import type { RawAxiosResponseHeaders } from 'axios'

import { api } from '@/lib/api'
import { downloadFile } from '@/utils/download-file'

type TicketAttachmentItem = {
  id: string
  filename: string
}

export type TicketAttachmentBlobPayload = {
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

export async function fetchTicketAttachmentBlob(
  ticketId: string,
  attachmentId: string,
): Promise<TicketAttachmentBlobPayload> {
  const response = await api.get<Blob>(
    `/tickets/${encodeURIComponent(ticketId)}/attachments/${encodeURIComponent(attachmentId)}/download`,
    { responseType: 'blob' },
  )
  const fromHeader = headerContentType(
    response.headers as RawAxiosResponseHeaders,
  )
  const blob = response.data
  const contentType = blob.type && blob.type.length > 0 ? blob.type : fromHeader
  return { blob, contentType }
}

export async function fetchTicketServiceAttachmentBlob(
  ticketId: string,
  attachmentId: string,
): Promise<TicketAttachmentBlobPayload> {
  const response = await api.get<Blob>(
    `/tickets/${encodeURIComponent(ticketId)}/attachments/services/${encodeURIComponent(attachmentId)}/download`,
    { responseType: 'blob' },
  )
  const fromHeader = headerContentType(
    response.headers as RawAxiosResponseHeaders,
  )
  const blob = response.data
  const contentType = blob.type && blob.type.length > 0 ? blob.type : fromHeader
  return { blob, contentType }
}

export async function downloadTicketAttachmentFile(
  attachment: TicketAttachmentItem,
  ticketId: string,
  options?: { serviceAttachment?: boolean },
) {
  const { blob } =
    options?.serviceAttachment === true
      ? await fetchTicketServiceAttachmentBlob(ticketId, attachment.id)
      : await fetchTicketAttachmentBlob(ticketId, attachment.id)
  downloadFile(blob, attachment.filename)
}
