import { api } from '@/lib/api'
import { downloadFile } from '@/utils/download-file'
import { getEmailAttachmentBlockedReason } from '@/utils/email-attachment-selection'

import type { AttachmentOut } from './get-email'

export async function fetchEmailAttachmentBlob(
  attachment: AttachmentOut,
  emailId: string,
) {
  const blockedReason = getEmailAttachmentBlockedReason(attachment)
  if (blockedReason && !attachment.is_prepared) throw new Error(blockedReason)
  const response = await api.get<Blob>(
    `/emails/${emailId}/attachments/${attachment.id}/${attachment.is_prepared ? 'prepared' : 'download'}`,
    {
      responseType: 'blob',
      ...(attachment.is_prepared
        ? { params: { token: attachment.preparation_token } }
        : {}),
    },
  )
  const contentType = response.headers['content-type']

  return {
    blob: response.data,
    contentType:
      (typeof contentType === 'string' ? contentType : undefined) ||
      attachment.mime_type ||
      'application/octet-stream',
  }
}

export async function downloadEmailAttachmentFile(
  attachment: AttachmentOut,
  emailId: string,
) {
  const blockedReason = getEmailAttachmentBlockedReason(attachment)
  if (blockedReason && !attachment.is_prepared) throw new Error(blockedReason)
  if (
    attachment.file_path.startsWith('http://') ||
    attachment.file_path.startsWith('https://')
  ) {
    window.open(attachment.file_path, '_blank', 'noopener,noreferrer')
    return
  }

  const response = await api.get<Blob>(
    `/emails/${emailId}/attachments/${attachment.id}/${attachment.is_prepared ? 'prepared' : 'download'}`,
    {
      responseType: 'blob',
      ...(attachment.is_prepared
        ? { params: { token: attachment.preparation_token } }
        : {}),
    },
  )
  downloadFile(response.data, attachment.filename)
}
