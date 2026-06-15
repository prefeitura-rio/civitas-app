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

function internalNumberPrefix(
  internalNumber: string | number | null | undefined,
): string | null {
  if (internalNumber == null) return null
  const trimmed = String(internalNumber).trim()
  if (!trimmed) return null
  if (/^\d+$/.test(trimmed)) {
    return String(parseInt(trimmed, 10))
  }
  return trimmed
}

/** Prefixo `{numeroInterno}-` no nome exibido/enviado dos anexos em fila antes de salvar. */
export function prefixPendingServiceFilename(
  internalNumber: string | number | null | undefined,
  filename: string,
): string {
  const num = internalNumberPrefix(internalNumber)
  if (!num) return filename

  const prefix = `${num}-`
  if (filename.startsWith(prefix)) return filename

  return `${prefix}${filename}`
}

function filenameKey(name: string): string {
  return name.toLowerCase()
}

/** Garante nome único entre `taken` (comparação case-insensitive). Atualiza `taken`. */
export function ensureUniqueFilename(
  candidate: string,
  taken: Set<string>,
): string {
  if (!taken.has(filenameKey(candidate))) return candidate

  const ext = getFilenameExtension(candidate)
  const base = getFilenameBase(candidate)

  for (let counter = 2; counter < 10_000; counter++) {
    const next = buildFilenameWithExtension(`${base} (${counter})`, ext)
    if (!taken.has(filenameKey(next))) return next
  }

  return buildFilenameWithExtension(
    `${base} (${crypto.randomUUID().slice(0, 8)})`,
    ext,
  )
}

export function createPendingServiceAttachments(
  files: File[],
  internalNumber?: string | number | null,
  existingFilenames: Iterable<string> = [],
): PendingServiceAttachment[] {
  const taken = new Set(
    Array.from(existingFilenames, (name) => filenameKey(name)),
  )
  const result: PendingServiceAttachment[] = []

  for (const file of files) {
    const prefixed = prefixPendingServiceFilename(internalNumber, file.name)
    const unique = ensureUniqueFilename(prefixed, taken)
    taken.add(filenameKey(unique))
    result.push({
      id: crypto.randomUUID(),
      file,
      filename: unique,
    })
  }

  return result
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
