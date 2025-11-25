import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import type {
  GenerateUploadUrlRequest,
  GenerateUploadUrlResponse,
} from '@/http/gcs/generate-upload-url'
import { uploadFileToGCS } from '@/http/gcs/upload-file'
import { sanitizePath } from '@/utils/sanitize-path'

import { getGcsUploadErrorMessage } from '../utils/get-gcs-error-message'
import type { FileWithProgress } from '../utils/upload-helpers'

type GenerateUploadUrlFn = (
  data: GenerateUploadUrlRequest,
) => Promise<{ data: GenerateUploadUrlResponse }>

interface UseUploadQueueParams {
  bucketName: string
  generateUploadUrl: GenerateUploadUrlFn
}

export function useUploadQueue({
  bucketName,
  generateUploadUrl,
}: UseUploadQueueParams) {
  const normalizedBucketName = bucketName.trim()
  const [files, setFiles] = useState<FileWithProgress[]>([])

  const addFiles = useCallback((newFiles: FileWithProgress[]) => {
    if (newFiles.length === 0) return
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  const uploadFile = useCallback(
    async (
      fileWithProgress: FileWithProgress,
    ): Promise<'success' | 'error'> => {
      if (!normalizedBucketName) {
        toast.error('Nome do bucket é obrigatório')
        return 'error'
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileWithProgress.id ? { ...f, status: 'uploading' } : f,
        ),
      )

      try {
        const contentType =
          fileWithProgress.file.type || 'application/octet-stream'
        const isResumable = fileWithProgress.file.size > 5 * 1024 * 1024

        const lastSlashIndex = fileWithProgress.relativePath.lastIndexOf('/')
        const filePath =
          lastSlashIndex >= 0
            ? sanitizePath(
                fileWithProgress.relativePath.substring(0, lastSlashIndex),
              )
            : undefined

        console.debug(
          '[GCS-UPLOAD] Payload',
          JSON.stringify(
            {
              fileName: fileWithProgress.file.name,
              filePath,
              bucketName: normalizedBucketName,
              contentType,
              resumable: isResumable,
              fileSize: fileWithProgress.file.size,
            },
            null,
            2,
          ),
        )

        const { data: uploadUrlData } = await generateUploadUrl({
          file_name: fileWithProgress.file.name,
          file_path: filePath,
          bucket_name: normalizedBucketName,
          content_type: contentType,
          resumable: isResumable,
          file_size: fileWithProgress.file.size,
        })

        if (!uploadUrlData.signed_url) {
          throw new Error('Upload URL was not returned by the server')
        }
        await uploadFileToGCS({
          file: fileWithProgress.file,
          uploadUrl: uploadUrlData.signed_url,
          resumable: isResumable,
          onProgress: (progress, status) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileWithProgress.id ? { ...f, progress, status } : f,
              ),
            )
          },
        })

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileWithProgress.id
              ? { ...f, status: 'success', progress: 100 }
              : f,
          ),
        )
        return 'success'
      } catch (error) {
        const errorMessage = getGcsUploadErrorMessage(error)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileWithProgress.id
              ? { ...f, status: 'error', error: errorMessage }
              : f,
          ),
        )
        console.error(
          '[GCS-UPLOAD] Error',
          JSON.stringify(
            {
              fileName: fileWithProgress.file.name,
              bucketName: normalizedBucketName,
              errorMessage,
            },
            null,
            2,
          ),
        )
        toast.error(
          `Erro ao fazer upload de ${fileWithProgress.file.name}: ${errorMessage}`,
        )
        return 'error'
      }
    },
    [normalizedBucketName, generateUploadUrl],
  )

  const startUploads = useCallback(
    async (overrideFiles?: FileWithProgress[]) => {
      const sourceFiles = overrideFiles ?? files

      if (sourceFiles.length === 0) {
        toast.error('Selecione pelo menos um arquivo para fazer upload')
        return
      }

      const pendingFiles = sourceFiles
        .filter((file) => file.status === 'pending')
        .sort((a, b) => a.file.size - b.file.size)

      if (pendingFiles.length === 0) {
        toast.info('Todos os arquivos já foram enviados')
        return
      }

      const MAX_CONCURRENT = 10
      const queue = [...pendingFiles]
      const active = new Set<Promise<void>>()
      let successCount = 0
      let errorCount = 0

      const processNext = async () => {
        while (queue.length > 0 && active.size < MAX_CONCURRENT) {
          const nextFile = queue.shift()
          if (!nextFile) break

          const uploadPromise = uploadFile(nextFile)
            .then((status) => {
              if (status === 'success') {
                successCount++
              } else {
                errorCount++
              }
            })
            .finally(() => {
              active.delete(uploadPromise)
              processNext()
            })

          active.add(uploadPromise)
        }
      }

      await processNext()
      while (active.size > 0) {
        await Promise.race(active)
      }

      if (successCount > 0 && errorCount === 0) {
        toast.success(`${successCount} arquivo(s) enviado(s) com sucesso!`)
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(
          `${successCount} arquivo(s) enviado(s) com sucesso, ${errorCount} falharam.`,
        )
      } else if (errorCount > 0 && successCount === 0) {
        toast.error(`${errorCount} arquivo(s) falharam no upload`)
      }
    },
    [files, uploadFile],
  )

  const retryErrorsAndStart = useCallback(async () => {
    const resetFiles: FileWithProgress[] = files.map(
      (f): FileWithProgress =>
        f.status === 'error'
          ? { ...f, status: 'pending', progress: 0, error: undefined }
          : f,
    )
    setFiles(resetFiles)
    await startUploads(resetFiles)
  }, [files, startUploads])

  const sortedFiles = useMemo(() => {
    const statusOrder = {
      uploading: 1,
      initiating: 1,
      pending: 2,
      error: 3,
      success: 4,
    }
    return [...files].sort((a, b) => {
      const orderDiff = statusOrder[a.status] - statusOrder[b.status]
      if (orderDiff !== 0) return orderDiff
      return 0
    })
  }, [files])

  const globalProgress = useMemo(() => {
    if (files.length === 0) return 0
    const totalProgress = files.reduce((sum, f) => sum + f.progress, 0)
    return totalProgress / files.length
  }, [files])

  const activeUploads = useMemo(
    () =>
      files.filter((f) => f.status === 'uploading' || f.status === 'initiating')
        .length,
    [files],
  )

  const hasErrors = useMemo(
    () => files.some((f) => f.status === 'error'),
    [files],
  )

  return {
    files,
    sortedFiles,
    globalProgress,
    activeUploads,
    hasErrors,
    addFiles,
    removeFile,
    clearFiles,
    retryErrorsAndStart,
    startUploads,
  }
}
