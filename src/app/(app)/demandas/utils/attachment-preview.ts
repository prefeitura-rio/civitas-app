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

/** Abre o blob numa aba nova quando o tipo foi confirmado. */
export function openPreviewBlob(blob: Blob, contentType: string): boolean {
  const mediaType = blob.type || contentType
  if (!isPreviewableContentType(mediaType)) return false

  const previewUrl = URL.createObjectURL(new Blob([blob], { type: mediaType }))
  const newTab = window.open(previewUrl, '_blank')
  if (!newTab) {
    URL.revokeObjectURL(previewUrl)
    return false
  }
  newTab.opener = null
  window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000)
  return true
}
