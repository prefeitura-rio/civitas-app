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

export type PutVideoToGcsProgress = {
  loaded: number
  total: number
}

export type PutVideoToGcsSignedUrlOptions = {
  onProgress?: (p: PutVideoToGcsProgress) => void
}

function putVideoToGcsSignedUrlWithProgress(
  signedUrl: string,
  file: File,
  contentType: string,
  onProgress: (p: PutVideoToGcsProgress) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedUrl)
    xhr.setRequestHeader('Content-Type', contentType)

    xhr.upload.onprogress = (ev) => {
      const total =
        ev.lengthComputable && ev.total > 0 ? ev.total : Math.max(file.size, 1)
      onProgress({ loaded: ev.loaded, total })
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }
      const text = (xhr.responseText ?? '').slice(0, 200)
      reject(
        new Error(
          text
            ? `Envio do vídeo falhou (${xhr.status}): ${text}`
            : `Envio do vídeo falhou (${xhr.status}).`,
        ),
      )
    }

    xhr.onerror = () => {
      reject(new Error('Envio do vídeo falhou (rede ou CORS).'))
    }

    xhr.onabort = () => {
      reject(new Error('Envio do vídeo cancelado.'))
    }

    xhr.send(file)
  })
}

export async function putVideoToGcsSignedUrl(
  signedUrl: string,
  file: File,
  contentType: string,
  options?: PutVideoToGcsSignedUrlOptions,
): Promise<void> {
  if (options?.onProgress) {
    await putVideoToGcsSignedUrlWithProgress(
      signedUrl,
      file,
      contentType,
      options.onProgress,
    )
    return
  }

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
