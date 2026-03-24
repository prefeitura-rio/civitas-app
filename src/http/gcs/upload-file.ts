export interface UploadFileOptions {
  file: File
  uploadUrl: string
  resumable: boolean
  onProgress?: (progress: number, status: 'initiating' | 'uploading') => void
}

const CHUNK_SIZE_BYTES = 16 * 1024 * 1024 // 16MB to avoid long timeouts on slow links
const FILE_TIMEOUT_MS = 300000 // 5 minutes default
const CHUNK_TIMEOUT_MS = 600000 // 10 minutes per chunk to reduce retries on slow links
const PROGRESS_THROTTLE_MS = 100

export async function uploadFileToGCS({
  file,
  uploadUrl,
  resumable,
  onProgress,
}: UploadFileOptions): Promise<void> {
  // Helper to perform XHR requests
  const performRequest = (
    method: string,
    url: string,
    body: File | Blob | null,
    headers: Record<string, string> = {},
    timeoutMs = FILE_TIMEOUT_MS,
  ): Promise<{ xhr: XMLHttpRequest; status: number }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      let resolved = false

      const safeResolve = (value: { xhr: XMLHttpRequest; status: number }) => {
        if (!resolved) {
          resolved = true
          resolve(value)
        }
      }

      const safeReject = (error: Error) => {
        if (!resolved) {
          resolved = true
          reject(error)
        }
      }

      xhr.timeout = timeoutMs
      xhr.addEventListener('timeout', () => {
        safeReject(new Error('Upload timeout'))
      })

      xhr.addEventListener('load', () => {
        safeResolve({ xhr, status: xhr.status })
      })

      xhr.addEventListener('error', () => {
        safeReject(new Error('Network error'))
      })

      xhr.addEventListener('abort', () => {
        safeReject(new Error('Request aborted'))
      })

      xhr.open(method, url)
      xhr.withCredentials = false

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      xhr.send(body)
    })
  }

  const contentType = file.type || 'application/octet-stream'

  if (resumable) {
    let sessionUri = uploadUrl

    const isSessionUri = new URL(uploadUrl).searchParams.has('upload_id')

    if (!isSessionUri) {
      if (onProgress) onProgress(0, 'initiating')

      const initiateHeaders = {
        'x-goog-resumable': 'start',
        'Content-Type': contentType,
      }

      const { xhr: initXhr, status: initStatus } = await performRequest(
        'POST',
        uploadUrl,
        null,
        initiateHeaders,
      )

      if (initStatus < 200 || initStatus >= 300) {
        throw new Error(`Failed to initiate upload: ${initStatus}`)
      }

      const locationHeader = initXhr.getResponseHeader('Location')
      if (!locationHeader) {
        throw new Error('Could not retrieve session URI from GCS response')
      }
      sessionUri = locationHeader
    }

    // Resumable upload loop with 308 Resume handling
    let offset = 0
    const fileSize = file.size
    let retryCount = 0
    const maxRetries = 5
    const CHUNK_SIZE = CHUNK_SIZE_BYTES

    while (offset < fileSize) {
      const chunkEnd = Math.min(offset + CHUNK_SIZE, fileSize)
      const chunk = file.slice(offset, chunkEnd)
      const chunkSize = chunk.size

      const headers: Record<string, string> = {
        'Content-Range': `bytes ${offset}-${offset + chunkSize - 1}/${fileSize}`,
      }

      try {
        const chunkPromise = new Promise<{
          xhr: XMLHttpRequest
          status: number
        }>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', sessionUri)
          xhr.withCredentials = false
          xhr.timeout = CHUNK_TIMEOUT_MS

          xhr.addEventListener('timeout', () => {
            reject(new Error('Upload timeout'))
          })

          Object.entries(headers).forEach(([k, v]) =>
            xhr.setRequestHeader(k, v),
          )

          // Throttle progress updates to improve performance
          let lastProgressUpdate = 0

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
              const now = Date.now()
              const isLastUpdate = e.loaded === e.total

              if (
                isLastUpdate ||
                now - lastProgressUpdate >= PROGRESS_THROTTLE_MS
              ) {
                const globalLoaded = offset + e.loaded
                const globalProgress = (globalLoaded / fileSize) * 100
                onProgress(globalProgress, 'uploading')
                lastProgressUpdate = now
              }
            }
          })

          xhr.addEventListener('load', () => {
            resolve({ xhr, status: xhr.status })
          })
          xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'))
          })
          xhr.addEventListener('abort', () => {
            reject(new Error('Upload aborted'))
          })

          xhr.send(chunk)
        })

        const { xhr, status } = await chunkPromise

        if (status === 308) {
          const rangeHeader = xhr.getResponseHeader('Range')
          if (rangeHeader) {
            const match = rangeHeader.match(/bytes=0-(\d+)/)
            if (match) {
              offset = parseInt(match[1], 10) + 1
              retryCount = 0
              continue
            }
          }
          retryCount++
        } else if (status >= 200 && status < 300) {
          if (onProgress) onProgress(100, 'uploading')
          return
        } else {
          if (retryCount < maxRetries && status >= 500) {
            retryCount++
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * retryCount),
            )
            continue
          }
          throw new Error(`Upload failed with status ${status}`)
        }
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount))
          continue
        }
        throw error
      }

      if (retryCount >= maxRetries) {
        throw new Error('Max retries exceeded')
      }
    }
  } else {
    // Standard Upload
    if (onProgress) onProgress(0, 'uploading')

    const headers = {
      'Content-Type': contentType,
    }

    // For non-resumable, we can use the performRequest helper with its own progress listener
    const { status } = await new Promise<{
      xhr: XMLHttpRequest
      status: number
    }>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', uploadUrl)
      xhr.withCredentials = false
      xhr.timeout = FILE_TIMEOUT_MS

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'))
      })

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      if (onProgress) {
        let lastProgressUpdate = 0

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const now = Date.now()
            const isLastUpdate = e.loaded === e.total

            if (
              isLastUpdate ||
              now - lastProgressUpdate >= PROGRESS_THROTTLE_MS
            ) {
              const progress = (e.loaded / e.total) * 100
              onProgress(progress, 'uploading')
              lastProgressUpdate = now
            }
          }
        })
      }

      xhr.addEventListener('load', () => resolve({ xhr, status: xhr.status }))
      xhr.addEventListener('error', () => reject(new Error('Network error')))
      xhr.addEventListener('abort', () => reject(new Error('Request aborted')))

      xhr.send(file)
    })

    if (status < 200 || status >= 300) {
      throw new Error(`Upload failed with status ${status}`)
    }
  }
}
