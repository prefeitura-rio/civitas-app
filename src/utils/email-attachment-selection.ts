const ATTACHMENT_EXTENSIONS_BLOCKED = new Set(['.mp4', '.mov'])

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
