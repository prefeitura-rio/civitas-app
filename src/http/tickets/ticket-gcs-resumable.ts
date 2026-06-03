const CHUNK_SIZE = 64 * 1024 * 1024
const MAX_RETRIES = 4
const BACKOFF_BASE_MS = 1_500

export type GcsResumableUploadProgress = {
  uploaded: number
  total: number
}

export type GcsResumableChunkedUploadOptions = {
  startByte?: number
  chunkSize?: number
  onProgress?: (progress: GcsResumableUploadProgress) => void
  onChunkComplete?: (uploadedBytes: number) => Promise<void>
  signal?: AbortSignal
}

export function isRetryableGcsError(status: number): boolean {
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function backoffDelay(attempt: number): number {
  const base = BACKOFF_BASE_MS * 2 ** attempt
  const jitter = base * (0.8 + Math.random() * 0.4)
  return Math.round(jitter)
}

function waitForOnline(signal?: AbortSignal): Promise<void> {
  if (typeof navigator === 'undefined' || navigator.onLine) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const onOnline = () => {
      cleanup()
      resolve()
    }
    const onAbort = () => {
      cleanup()
      reject(new DOMException('Upload cancelado.', 'AbortError'))
    }
    const cleanup = () => {
      window.removeEventListener('online', onOnline)
      signal?.removeEventListener('abort', onAbort)
    }

    window.addEventListener('online', onOnline)
    signal?.addEventListener('abort', onAbort)
  })
}

function parseRangeHeader(range: string | null): number {
  if (!range) return 0
  const match = /^bytes=\d+-(\d+)/.exec(range)
  if (!match) return 0
  return parseInt(match[1], 10) + 1
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries: number = MAX_RETRIES,
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await waitForOnline(init.signal ?? undefined)
      const res = await fetch(url, init)

      if (res.ok || res.status === 308 || !isRetryableGcsError(res.status)) {
        return res
      }

      lastError = new Error(`Envio falhou (${res.status}).`)
    } catch (err) {
      if (init.signal?.aborted) throw err
      lastError = err
    }

    if (attempt < maxRetries) {
      await sleep(backoffDelay(attempt))
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Envio falhou após várias tentativas.')
}

export async function queryGcsSessionOffset(
  sessionUri: string,
  totalBytes: number,
  signal?: AbortSignal,
): Promise<number> {
  const res = await fetchWithRetry(
    sessionUri,
    {
      method: 'PUT',
      headers: {
        'Content-Range': `bytes */${totalBytes}`,
        'Content-Length': '0',
      },
      signal,
    },
    MAX_RETRIES,
  )

  if (res.status === 200 || res.status === 201) {
    return totalBytes
  }

  if (res.status === 308) {
    return parseRangeHeader(res.headers.get('Range'))
  }

  const text = await res.text().catch(() => '')
  throw new Error(
    text
      ? `Não foi possível consultar o upload (${res.status}): ${text.slice(0, 200)}`
      : `Não foi possível consultar o upload (${res.status}).`,
  )
}

export async function gcsResumableChunkedUpload(
  sessionUri: string,
  file: File,
  contentType: string,
  options?: GcsResumableChunkedUploadOptions,
): Promise<void> {
  const total = file.size
  const chunkSize = options?.chunkSize ?? CHUNK_SIZE
  let offset = options?.startByte ?? 0

  if (offset >= total) return

  try {
    const confirmedOffset = await queryGcsSessionOffset(
      sessionUri,
      total,
      options?.signal,
    )
    if (confirmedOffset >= total) {
      options?.onProgress?.({ uploaded: total, total })
      await options?.onChunkComplete?.(total)
      return
    }
    offset = Math.max(offset, confirmedOffset)
  } catch {
    if (offset > 0) throw new Error('Não foi possível retomar o upload.')
  }

  options?.onProgress?.({ uploaded: offset, total })

  while (offset < total) {
    if (options?.signal?.aborted) {
      throw new DOMException('Upload cancelado.', 'AbortError')
    }

    const end = Math.min(offset + chunkSize, total) - 1
    const chunk = file.slice(offset, end + 1)

    const res = await fetchWithRetry(sessionUri, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Range': `bytes ${offset}-${end}/${total}`,
      },
      body: chunk,
      signal: options?.signal,
    })

    if (res.status === 200 || res.status === 201) {
      options?.onProgress?.({ uploaded: total, total })
      await options?.onChunkComplete?.(total)
      return
    }

    if (res.status === 308) {
      const nextOffset = parseRangeHeader(res.headers.get('Range'))
      offset = nextOffset > offset ? nextOffset : end + 1
      options?.onProgress?.({ uploaded: offset, total })
      await options?.onChunkComplete?.(offset)
      continue
    }

    const text = await res.text().catch(() => '')
    throw new Error(
      text
        ? `Envio falhou (${res.status}): ${text.slice(0, 200)}`
        : `Envio falhou (${res.status}).`,
    )
  }
}
