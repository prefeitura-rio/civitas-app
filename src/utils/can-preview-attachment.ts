const PREVIEWABLE_CONTENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
])

const PREVIEWABLE_ATTACHMENT_EXTENSIONS = new Set([
  '.pdf',
  '.jpeg',
  '.jpg',
  '.png',
])

/** Tipo que a API confirmou e o navegador pode mostrar sem baixar. */
export function isPreviewableContentType(contentType: string): boolean {
  const media = contentType.split(';')[0]?.trim().toLowerCase() ?? ''
  return PREVIEWABLE_CONTENT_TYPES.has(media)
}

/** Retorna se um anexo pode ser aberto inline com segurança no navegador. */
export function canPreviewAttachment(filename: string): boolean {
  const dot = filename.lastIndexOf('.')
  const extension = dot === -1 ? '' : filename.slice(dot).toLowerCase()
  return PREVIEWABLE_ATTACHMENT_EXTENSIONS.has(extension)
}
