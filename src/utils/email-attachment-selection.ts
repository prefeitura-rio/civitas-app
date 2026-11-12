const ATTACHMENT_EXTENSIONS_BLOCKED = new Set(['.mp4', '.mov'])
export const MAX_EMAIL_ATTACHMENT_BYTES = 20 * 1024 * 1024
export const EMAIL_ATTACHMENT_TOO_LARGE_REASON =
  'Arquivo maior que o permitido (20 MB).'

export function getEmailAttachmentBlockedReason(attachment: {
  size?: number
  can_select?: boolean
  blocked_reason?: string | null
  is_prepared?: boolean
}): string | null {
  if (
    attachment.is_prepared &&
    (attachment.size ?? 0) > MAX_EMAIL_ATTACHMENT_BYTES
  ) {
    return EMAIL_ATTACHMENT_TOO_LARGE_REASON
  }
  if (attachment.can_select === false) {
    return (
      attachment.blocked_reason ||
      'Anexo indisponível para inclusão na demanda.'
    )
  }
  return null
}

export function isBlockedEmailAttachment(filename?: string): boolean {
  if (!filename) return false
  const dot = filename.lastIndexOf('.')
  const extension = dot === -1 ? '' : filename.slice(dot).toLowerCase()
  return ATTACHMENT_EXTENSIONS_BLOCKED.has(extension)
}

export function filterSelectableEmailAttachments<
  T extends { filename?: string },
>(attachments: T[]): T[] {
  return attachments.filter(
    (attachment) => !isBlockedEmailAttachment(attachment.filename),
  )
}

export function isEmailAttachmentSelected(
  attachment: {
    id: number
    filename?: string
    size?: number
    can_select?: boolean
    blocked_reason?: string | null
    is_prepared?: boolean
  },
  overrides: Record<number, boolean>,
): boolean {
  return (
    attachment.is_prepared === true &&
    overrides[attachment.id] !== false &&
    !isBlockedEmailAttachment(attachment.filename) &&
    !getEmailAttachmentBlockedReason(attachment)
  )
}
