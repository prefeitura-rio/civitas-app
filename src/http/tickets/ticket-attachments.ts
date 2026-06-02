import { api } from '@/lib/api'

export type TicketAttachmentOut = {
  id: string
  filename: string
  content_type?: string | null
  size_bytes: number
  created_at: string
  service_type?: string | null
  service_id?: string | null
  playback?: {
    signed_url?: string | null
    expires_at?: string | null
  } | null
}

export type TicketAttachmentServiceScope = {
  service_type: string
  service_id?: string
  service_index?: number
}

export type TicketVideoUploadUrlRequest = {
  filename: string
  content_type: string
  file_size: number
  resumable?: boolean
} & Partial<TicketAttachmentServiceScope>

export type TicketVideoUploadUrlResponse = {
  signed_url: string
  session_uri?: string
  storage_key: string
  resumable: boolean
  expires_in_minutes: number
}

export type TicketAttachmentCompleteIn = {
  storage_key: string
  filename: string
  content_type: string
  size_bytes: number
} & Partial<TicketAttachmentServiceScope>

/** Metadado por ficheiro no PUT multipart `/services` (`attachment_metadata`). */
export type TicketAttachmentServiceScopeMetadataIn = {
  service_type: string
  service_id?: string
  service_index?: number
}

/** @deprecated Use TicketAttachmentServiceScopeMetadataIn */
export type TicketAttachmentMultipartMetadata =
  TicketAttachmentServiceScopeMetadataIn

export type TicketAttachmentPlaybackUrlOut = {
  signed_url: string
  expires_at: string
}

export async function getTicketAttachments(ticketId: string) {
  const { data } = await api.get<TicketAttachmentOut[]>(
    `/tickets/${encodeURIComponent(ticketId)}/attachments`,
  )
  return data
}

export async function deleteTicketAttachment(
  ticketId: string,
  attachmentId: string,
) {
  await api.delete(
    `/tickets/${encodeURIComponent(ticketId)}/attachments/${encodeURIComponent(attachmentId)}`,
  )
}

export async function deleteTicketServiceAttachment(
  ticketId: string,
  attachmentId: string,
) {
  await api.delete(
    `/tickets/${encodeURIComponent(ticketId)}/attachments/services/${encodeURIComponent(attachmentId)}`,
  )
}

export async function requestTicketVideoUploadUrl(
  ticketId: string,
  body: TicketVideoUploadUrlRequest,
) {
  const payload: TicketVideoUploadUrlRequest = {
    ...body,
    resumable: body.resumable ?? true,
  }
  const { data } = await api.post<TicketVideoUploadUrlResponse>(
    `/tickets/${encodeURIComponent(ticketId)}/attachments/services/upload-url`,
    payload,
  )
  return data
}

export async function getTicketServiceAttachmentPlaybackUrl(
  ticketId: string,
  attachmentId: string,
  expirationMinutes?: number,
) {
  const { data } = await api.get<TicketAttachmentPlaybackUrlOut>(
    `/tickets/${encodeURIComponent(ticketId)}/attachments/services/${encodeURIComponent(attachmentId)}/playback-url`,
    {
      params:
        expirationMinutes != null
          ? { expiration_minutes: expirationMinutes }
          : undefined,
    },
  )
  return data
}

export function resolveGcsSessionUri(
  uploadMeta: TicketVideoUploadUrlResponse,
): string {
  return uploadMeta.session_uri ?? uploadMeta.signed_url
}
