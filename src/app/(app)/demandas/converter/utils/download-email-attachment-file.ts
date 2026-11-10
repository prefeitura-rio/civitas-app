import type { AttachmentOut } from '@/http/emails/get-email'
import { api } from '@/lib/api'
import { getEmailAttachmentBlockedReason } from '@/utils/email-attachment-selection'

export async function downloadEmailAttachmentAsFile(
  emailId: string,
  attachment: AttachmentOut,
): Promise<File> {
  const blockedReason = getEmailAttachmentBlockedReason(attachment)
  if (blockedReason) throw new Error(blockedReason)
  if (
    attachment.file_path.startsWith('http://') ||
    attachment.file_path.startsWith('https://')
  ) {
    const res = await fetch(attachment.file_path)
    const blob = await res.blob()
    return new File([blob], attachment.filename, {
      type: blob.type || attachment.mime_type || 'application/octet-stream',
    })
  }

  const res = await api.get(
    `/emails/${emailId}/attachments/${attachment.id}/download`,
    { responseType: 'blob' },
  )
  return new File([res.data], attachment.filename, {
    type: res.data.type || attachment.mime_type || 'application/octet-stream',
  })
}
