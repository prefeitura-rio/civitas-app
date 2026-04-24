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
  service_id: string
}

export type TicketVideoUploadUrlRequest = {
  filename: string
  content_type: string
  file_size: number
  resumable?: boolean
} & Partial<TicketAttachmentServiceScope>

export type TicketVideoUploadUrlResponse = {
  signed_url: string
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

export type TicketAttachmentMultipartMetadata = {
  service_type: string
  service_id: string
}

export type TicketAttachmentPlaybackUrlOut = {
  signed_url: string
  expires_in_seconds: number
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

export async function requestTicketVideoUploadUrl(
  ticketId: string,
  body: TicketVideoUploadUrlRequest,
) {
  const payload: TicketVideoUploadUrlRequest = {
    ...body,
    resumable: body.resumable ?? true,
  }
  const { data } = await api.post<TicketVideoUploadUrlResponse>(
    `/tickets/${encodeURIComponent(ticketId)}/attachments/upload-url`,
    payload,
  )
  return data
}

export async function completeTicketVideoAttachment(
  ticketId: string,
  body: TicketAttachmentCompleteIn,
) {
  const { data } = await api.post<TicketAttachmentOut>(
    `/tickets/${encodeURIComponent(ticketId)}/attachments/complete`,
    body,
  )
  return data
}

export async function uploadTicketAttachmentsMultipart(
  ticketId: string,
  files: File[],
  metadata?: TicketAttachmentMultipartMetadata,
) {
  const form = new FormData()
  for (const f of files) {
    form.append('files', f)
  }
  if (metadata?.service_type && metadata?.service_id) {
    form.append(
      'metadata',
      JSON.stringify({
        service_type: metadata.service_type,
        service_id: metadata.service_id,
      }),
    )
  }

  const { data } = await api.post<TicketAttachmentOut[]>(
    `/tickets/${encodeURIComponent(ticketId)}/attachments`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}

export async function getTicketAttachmentPlaybackUrl(
  ticketId: string,
  attachmentId: string,
  expirationMinutes?: number,
) {
  const { data } = await api.get<TicketAttachmentPlaybackUrlOut>(
    `/tickets/${encodeURIComponent(ticketId)}/attachments/${encodeURIComponent(attachmentId)}/playback-url`,
    {
      params:
        expirationMinutes != null
          ? { expiration_minutes: expirationMinutes }
          : undefined,
    },
  )
  return data
}

/** PUT directo ao GCS — não enviar Authorization da app. */
export async function putVideoToGcsSignedUrl(
  signedUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const res = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(file.size),
    },
    body: file,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      text
        ? `Envio do vídeo falhou (${res.status}): ${text.slice(0, 200)}`
        : `Envio do vídeo falhou (${res.status}).`,
    )
  }
}
