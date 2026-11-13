export const MAX_TICKET_ATTACHMENT_BYTES = 20 * 1024 * 1024

const ALLOWED_TICKET_ATTACHMENT_EXTENSIONS = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.jpeg',
  '.jpg',
  '.png',
])

export function isAllowedTicketAttachment(filename: string): boolean {
  const dot = filename.lastIndexOf('.')
  const extension = dot === -1 ? '' : filename.slice(dot).toLowerCase()
  return ALLOWED_TICKET_ATTACHMENT_EXTENSIONS.has(extension)
}
