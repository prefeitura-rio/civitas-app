'use client'

import { useEffect, useRef, useState } from 'react'

import { prepareManualTicketAttachment } from '@/http/tickets/prepare-manual-ticket-attachment'
import { isApiError } from '@/lib/api'
import { getApiErrorMessage } from '@/utils/error-handlers'

const MIN_COMPRESSION_BYTES = 5 * 1024 * 1024

type Preparation =
  | { status: 'preparing' }
  | { status: 'ready'; file: File; hash: string }
  | { status: 'error'; message: string }
  | { status: 'invalid'; message: string }

export function usePreparedManualAttachments(files: File[]) {
  const [preparations, setPreparations] = useState<Map<File, Preparation>>(
    () => new Map(),
  )
  const inFlight = useRef(new Set<File>())
  const currentFiles = useRef(files)
  currentFiles.current = files

  useEffect(() => {
    setPreparations((prev) => {
      if ([...prev.keys()].every((file) => files.includes(file))) return prev
      return new Map([...prev].filter(([file]) => files.includes(file)))
    })
  }, [files])

  useEffect(() => {
    for (const file of files) {
      if (
        file.size <= MIN_COMPRESSION_BYTES ||
        preparations.has(file) ||
        inFlight.current.has(file)
      ) {
        continue
      }
      inFlight.current.add(file)
      setPreparations((prev) =>
        new Map(prev).set(file, { status: 'preparing' }),
      )
      prepareManualTicketAttachment(file)
        .then((result) => {
          inFlight.current.delete(file)
          if (!currentFiles.current.includes(file)) return
          setPreparations((prev) =>
            new Map(prev).set(file, { status: 'ready', ...result }),
          )
        })
        .catch((error: unknown) => {
          inFlight.current.delete(file)
          if (!currentFiles.current.includes(file)) return
          const status =
            isApiError(error) &&
            [400, 413, 415, 422].includes(error.response?.status ?? 0)
              ? 'invalid'
              : 'error'
          setPreparations((prev) =>
            new Map(prev).set(file, {
              status,
              message:
                error instanceof Error && !('response' in error)
                  ? error.message
                  : getApiErrorMessage(error),
            }),
          )
        })
    }
  }, [files, preparations])

  function retry(file: File) {
    setPreparations((prev) => {
      const next = new Map(prev)
      next.delete(file)
      return next
    })
  }

  function filesForUpload(selected: File[]) {
    const preparedFileHashes: Record<number, string> = {}
    const uploadFiles = selected.map((file, index) => {
      const preparation = preparations.get(file)
      if (preparation?.status !== 'ready') return file
      preparedFileHashes[index] = preparation.hash
      return preparation.file
    })
    return { files: uploadFiles, preparedFileHashes }
  }

  function isPreparingFor(selected: File[]) {
    return selected.some(
      (file) =>
        file.size > MIN_COMPRESSION_BYTES &&
        (!preparations.has(file) ||
          preparations.get(file)?.status === 'preparing'),
    )
  }

  function hasInvalidFor(selected: File[]) {
    return selected.some((file) => preparations.get(file)?.status === 'invalid')
  }

  return {
    preparations,
    retry,
    filesForUpload,
    isPreparing: isPreparingFor(files),
    isPreparingFor,
    hasInvalidFor,
  }
}
