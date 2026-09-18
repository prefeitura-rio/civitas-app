const PREVIEWABLE_ATTACHMENT_EXTENSIONS = new Set([
  '.pdf',
  '.jpeg',
  '.jpg',
  '.png',
])

/** Retorna se um anexo pode ser aberto inline com segurança no navegador. */
export function canPreviewAttachment(filename: string): boolean {
  const dot = filename.lastIndexOf('.')
  const extension = dot === -1 ? '' : filename.slice(dot).toLowerCase()
  return PREVIEWABLE_ATTACHMENT_EXTENSIONS.has(extension)
}
