import type { TicketAttachmentOut } from '@/http/tickets/ticket-attachments'

export const ZIP_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
] as const

export const DEFAULT_ZIP_CONTENT_TYPE = 'application/zip'

export function isZipFile(file: File): boolean {
  const t = file.type.toLowerCase()
  if (ZIP_MIME_TYPES.includes(t as (typeof ZIP_MIME_TYPES)[number])) return true
  return /\.zip$/i.test(file.name)
}

export function isVideoFile(file: File): boolean {
  return file.type.toLowerCase().startsWith('video/')
}

export function usesGcsSignedUrlUpload(file: File): boolean {
  return isVideoFile(file) || isZipFile(file)
}

export function resolveGcsUploadContentType(file: File): string {
  if (isZipFile(file)) {
    return file.type || DEFAULT_ZIP_CONTENT_TYPE
  }
  return file.type || 'video/mp4'
}

export function isZipAttachment(att: TicketAttachmentOut): boolean {
  const ct = (att.content_type ?? '').toLowerCase()
  if (ZIP_MIME_TYPES.includes(ct as (typeof ZIP_MIME_TYPES)[number]))
    return true
  return /\.zip$/i.test(att.filename ?? '')
}

export function isVideoAttachment(att: TicketAttachmentOut): boolean {
  return (att.content_type ?? '').toLowerCase().startsWith('video/')
}

export function usesGcsSignedUrlAttachment(att: TicketAttachmentOut): boolean {
  return isVideoAttachment(att) || isZipAttachment(att)
}

export function gcsAttachmentLabel(att: TicketAttachmentOut): string {
  return isZipAttachment(att) ? 'ZIP' : 'Vídeo'
}
