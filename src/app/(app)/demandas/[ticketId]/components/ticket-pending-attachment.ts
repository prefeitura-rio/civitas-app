export type PendingServiceAttachment = {
  id: string
  file: File
  filename: string
}

export function getFilenameExtension(name: string): string {
  const i = name.lastIndexOf('.')
  if (i <= 0 || i === name.length - 1) return ''
  return name.slice(i)
}

export function getFilenameBase(name: string): string {
  const ext = getFilenameExtension(name)
  if (!ext) return name
  return name.slice(0, -ext.length)
}

export function buildFilenameWithExtension(
  base: string,
  extension: string,
): string {
  const trimmedBase = base.trim()
  if (!extension) {
    return trimmedBase.length > 0 ? trimmedBase : ''
  }
  const basePart = trimmedBase.length > 0 ? trimmedBase : 'arquivo'
  return `${basePart}${extension}`
}

/** Extensão fixa do ficheiro original; só o nome base é editável. */
export function normalizePendingFilename(
  filename: string,
  originalFilename: string,
): string {
  const ext = getFilenameExtension(originalFilename)
  const fallbackBase = getFilenameBase(originalFilename).trim() || 'arquivo'
  const base = getFilenameBase(filename).trim() || fallbackBase
  return buildFilenameWithExtension(base, ext)
}

export function getPendingAttachmentBaseName(
  item: PendingServiceAttachment,
): string {
  return getFilenameBase(
    normalizePendingFilename(item.filename, item.file.name),
  )
}

export function renamePendingAttachmentBase(
  item: PendingServiceAttachment,
  base: string,
): string {
  const ext = getFilenameExtension(item.file.name)
  return buildFilenameWithExtension(base, ext)
}

export function createPendingServiceAttachments(
  files: File[],
): PendingServiceAttachment[] {
  return files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    filename: file.name,
  }))
}

/** File com o nome escolhido no rascunho, para envio multipart / vídeo. */
export function pendingAttachmentAsUploadFile(
  item: PendingServiceAttachment,
): File {
  const name = normalizePendingFilename(item.filename, item.file.name)
  if (name === item.file.name) return item.file
  return new File([item.file], name, {
    type: item.file.type,
    lastModified: item.file.lastModified,
  })
}
