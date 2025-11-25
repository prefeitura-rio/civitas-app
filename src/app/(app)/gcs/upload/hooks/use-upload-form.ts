import type React from 'react'
import { useCallback, useState } from 'react'

import type { FileWithProgress } from '../utils/upload-helpers'
import { createFileWithProgress } from '../utils/upload-helpers'

// Custom interfaces for File System Access API
interface GCSFileSystemDirectoryReader<T> {
  readEntries: (successCallback: (entries: T[]) => void) => void
}

interface GCSFileSystemEntry {
  isFile: boolean
  isDirectory: boolean
  name: string
  file: (callback: (file: File) => void) => void
  createReader: () => GCSFileSystemDirectoryReader<GCSFileSystemEntry>
}

interface DataTransferItemWithWebkit {
  webkitGetAsEntry: () => GCSFileSystemEntry | null
}

interface FileWithWebkitPath extends File {
  webkitRelativePath: string
}

interface UseUploadFormParams {
  files: FileWithProgress[]
  addFiles: (files: FileWithProgress[]) => void
  startUploads: () => Promise<void>
  retryErrorsAndStart: () => Promise<void>
  clearFiles: () => void
}

export function useUploadForm({
  files,
  addFiles,
  startUploads,
  retryErrorsAndStart,
  clearFiles,
}: UseUploadFormParams) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return

      const newFiles: FileWithProgress[] = Array.from(fileList).map((file) => {
        const fileWithPath = file as unknown as FileWithWebkitPath
        const relativePath = fileWithPath.webkitRelativePath || file.name
        return createFileWithProgress(file, relativePath)
      })

      addFiles(newFiles)
    },
    [addFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const traverseFileTree = useCallback(
    async (
      item: GCSFileSystemEntry,
      path = '',
    ): Promise<FileWithProgress[]> => {
      return new Promise((resolve) => {
        if (item.isFile) {
          item.file((file: File) => {
            const relativePath = path + file.name
            resolve([createFileWithProgress(file, relativePath)])
          })
        } else if (item.isDirectory) {
          const dirReader = item.createReader()
          const entries: GCSFileSystemEntry[] = []

          const readEntries = () => {
            dirReader.readEntries(async (results: GCSFileSystemEntry[]) => {
              if (results.length === 0) {
                const allFiles: FileWithProgress[] = []
                for (const entry of entries) {
                  const files = await traverseFileTree(
                    entry,
                    path + item.name + '/',
                  )
                  allFiles.push(...files)
                }
                resolve(allFiles)
              } else {
                entries.push(...results)
                readEntries()
              }
            })
          }
          readEntries()
        } else {
          resolve([])
        }
      })
    },
    [],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const collected = new Map<string, FileWithProgress>()

      const addIfNew = (fileWithProgress: FileWithProgress) => {
        const key = `${fileWithProgress.relativePath}-${fileWithProgress.file.size}-${fileWithProgress.file.lastModified}`
        if (collected.has(key)) return
        collected.set(key, fileWithProgress)
      }

      Array.from(e.dataTransfer.files || []).forEach((file) => {
        const fileWithPath = file as unknown as FileWithWebkitPath
        const relativePath = fileWithPath.webkitRelativePath || file.name
        addIfNew(createFileWithProgress(file, relativePath))
      })

      const items = Array.from(e.dataTransfer.items)
      for (const item of items) {
        const itemWithWebkit = item as unknown as DataTransferItemWithWebkit
        const entry = itemWithWebkit.webkitGetAsEntry?.()
        if (entry) {
          const files = await traverseFileTree(entry)
          files.forEach(addIfNew)
        }
      }

      if (collected.size > 0) {
        addFiles(Array.from(collected.values()))
      }
    },
    [addFiles, traverseFileTree],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    },
    [handleFiles],
  )

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      await startUploads()
    },
    [startUploads],
  )

  const handleClear = useCallback(() => {
    clearFiles()
  }, [clearFiles])

  const handleRetry = useCallback(async () => {
    await retryErrorsAndStart()
  }, [retryErrorsAndStart])

  const handleExportErrors = useCallback(() => {
    const csvHeader = 'Nome do Arquivo,Caminho Relativo,Mensagem de Erro\n'
    const csvContent = files
      .filter((f) => f.status === 'error')
      .map((f) => {
        const name = `"${f.file.name.replace(/"/g, '""')}"`
        const path = `"${f.relativePath.replace(/"/g, '""')}"`
        const error = `"${(f.error || 'Desconhecido').replace(/"/g, '""')}"`
        return `${name},${path},${error}`
      })
      .join('\n')

    const blob = new Blob([csvHeader + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `erros-upload-${new Date().toISOString()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [files])

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    handleSubmit,
    handleClear,
    handleRetry,
    handleExportErrors,
  }
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
