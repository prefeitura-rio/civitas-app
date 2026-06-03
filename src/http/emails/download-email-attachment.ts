import { api } from '@/lib/api'
import { downloadFile } from '@/utils/download-file'

import type { AttachmentOut } from './get-email'

export async function downloadEmailAttachmentFile(
  attachment: AttachmentOut,
  emailId: string,
) {
  if (
    attachment.file_path.startsWith('http://') ||
    attachment.file_path.startsWith('https://')
  ) {
    window.open(attachment.file_path, '_blank', 'noopener,noreferrer')
    return
  }

  const response = await api.get<Blob>(
    `/emails/${emailId}/attachments/${attachment.id}/download`,
    {
      responseType: 'blob',
    },
  )
  downloadFile(response.data, attachment.filename)
}
