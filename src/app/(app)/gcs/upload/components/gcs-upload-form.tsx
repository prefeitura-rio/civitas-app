'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, File, Upload, X } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { InputError } from '@/components/custom/input-error'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { config } from '@/config'
import { generateUploadUrl } from '@/http/gcs/generate-upload-url'
import { uploadFileToGCS } from '@/http/gcs/upload-file'

import { getGcsUploadErrorMessage } from '../utils/get-gcs-error-message'

const gcsUploadFormSchema = z.object({
  bucket_name: z.string().min(1, { message: 'Nome do bucket é obrigatório' }),
})

type GcsUploadForm = z.infer<typeof gcsUploadFormSchema>

interface FileWithProgress {
  file: File
  progress: number
  status: 'pending' | 'initiating' | 'uploading' | 'success' | 'error'
  error?: string
}

export function GcsUploadForm() {
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<GcsUploadForm>({
    resolver: zodResolver(gcsUploadFormSchema),
    defaultValues: {
      bucket_name: config.arquivoOperacionalBucketName,
    },
  })

  const bucketName = watch('bucket_name')

  const { mutateAsync: generateUploadUrlMutation } = useMutation({
    mutationFn: generateUploadUrl,
  })

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    const newFiles: FileWithProgress[] = Array.from(fileList).map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }, [])

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    },
    [handleFiles],
  )

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const uploadFile = useCallback(
    async (fileWithProgress: FileWithProgress, index: number) => {
      if (!bucketName) {
        toast.error('Nome do bucket é obrigatório')
        return
      }

      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: 'uploading' } : f)),
      )

      try {
        const contentType =
          fileWithProgress.file.type || 'application/octet-stream'
        const isResumable = fileWithProgress.file.size > 5 * 1024 * 1024
        const { data: uploadUrlData } = await generateUploadUrlMutation({
          file_name: fileWithProgress.file.name,
          bucket_name: bucketName,
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
              prev.map((f, i) =>
                i === index ? { ...f, progress, status } : f,
              ),
            )
          },
        })

        setFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, status: 'success', progress: 100 } : f,
          ),
        )
      } catch (error) {
        const errorMessage = getGcsUploadErrorMessage(error)
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, status: 'error', error: errorMessage } : f,
          ),
        )
        toast.error(
          `Erro ao fazer upload de ${fileWithProgress.file.name}: ${errorMessage}`,
        )
      }
    },
    [bucketName, generateUploadUrlMutation],
  )

  async function onSubmit() {
    if (files.length === 0) {
      toast.error('Selecione pelo menos um arquivo para fazer upload')
      return
    }

    const pendingFiles = files
      .map((f, i) => ({ file: f, index: i }))
      .filter(({ file }) => file.status === 'pending')
      .sort((a, b) => a.file.file.size - b.file.file.size) // Sort by size (smallest first)

    if (pendingFiles.length === 0) {
      toast.info('Todos os arquivos já foram enviados')
      return
    }

    const MAX_CONCURRENT = 10
    const queue = [...pendingFiles]
    const active = new Set<Promise<void>>()

    const processNext = async () => {
      while (queue.length > 0 && active.size < MAX_CONCURRENT) {
        const item = queue.shift()
        if (!item) break

        const uploadPromise = uploadFile(item.file, item.index).finally(() => {
          active.delete(uploadPromise)
          processNext() // Process next when one completes
        })

        active.add(uploadPromise)
      }
    }

    // Start initial batch
    await processNext()

    // Wait for all to complete
    while (active.size > 0) {
      await Promise.race(active)
    }

    // Final toast with results
    const results = files.filter((f) => f.status !== 'pending')
    const successCount = results.filter((f) => f.status === 'success').length
    const errorCount = results.filter((f) => f.status === 'error').length

    if (successCount > 0 && errorCount === 0) {
      toast.success(`${successCount} arquivo(s) enviado(s) com sucesso!`)
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(
        `${successCount} arquivo(s) enviado(s) com sucesso, ${errorCount} falharam.`,
      )
    } else if (errorCount > 0 && successCount === 0) {
      toast.error(`${errorCount} arquivo(s) falharam no upload`)
    }
  }

  function handleClear() {
    setFiles([])
    reset()
  }

  // Sort files dynamically: uploading/initiating → top, success → bottom, pending → middle
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

  // Calculate global progress
  const globalProgress = useMemo(() => {
    if (files.length === 0) return 0
    const totalProgress = files.reduce((sum, f) => sum + f.progress, 0)
    return totalProgress / files.length
  }, [files])

  const activeUploads = files.filter(
    (f) => f.status === 'uploading' || f.status === 'initiating',
  ).length

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="mx-auto w-full max-w-[700px] space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivos para GCS</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-12rem)] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <Label htmlFor="bucket_name">Nome do Bucket *</Label>
                <InputError message={errors.bucket_name?.message} />
              </div>
              <Input
                id="bucket_name"
                {...register('bucket_name')}
                type="text"
                placeholder="ex: meu-bucket"
              />
            </div>

            {/* Global Progress Bar for Multiple Files */}
            {files.length > 1 && activeUploads > 0 && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Progresso Geral</span>
                  <span className="text-muted-foreground">
                    {Math.round(globalProgress)}%
                  </span>
                </div>
                <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${globalProgress}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Enviando:{' '}
                    {
                      files.filter(
                        (f) =>
                          f.status === 'uploading' || f.status === 'initiating',
                      ).length
                    }
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    Pendentes:{' '}
                    {files.filter((f) => f.status === 'pending').length}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Enviados:{' '}
                    {files.filter((f) => f.status === 'success').length}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Erros: {files.filter((f) => f.status === 'error').length}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <Label>Arquivos</Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'} `}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-center text-sm font-medium">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  Você pode selecionar múltiplos arquivos
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Arquivos Selecionados ({files.length})</Label>
                <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border p-4">
                  {sortedFiles.map((fileWithProgress, index) => {
                    // Find original index for state updates
                    const originalIndex = files.indexOf(fileWithProgress)
                    return (
                      <div
                        key={`${fileWithProgress.file.name}-${index}`}
                        className="flex items-center justify-between rounded border p-3"
                      >
                        <div className="flex flex-1 items-center gap-3">
                          <File className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {fileWithProgress.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(fileWithProgress.file.size)}
                            </p>
                            {(fileWithProgress.status === 'uploading' ||
                              fileWithProgress.status === 'initiating') && (
                              <div className="mt-2">
                                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                                  <span>
                                    {fileWithProgress.status === 'initiating'
                                      ? 'Iniciando...'
                                      : 'Enviando...'}
                                  </span>
                                  <span>
                                    {Math.round(fileWithProgress.progress)}%
                                  </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full bg-primary transition-all"
                                    style={{
                                      width: `${fileWithProgress.progress}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            {fileWithProgress.status === 'success' && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Upload concluído</span>
                              </div>
                            )}
                            {fileWithProgress.status === 'error' && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                                <AlertCircle className="h-3 w-3" />
                                <span>
                                  {fileWithProgress.error || 'Erro no upload'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(originalIndex)}
                          disabled={fileWithProgress.status === 'uploading'}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={files.length === 0}>
                <Upload className="mr-2 h-4 w-4" />
                Enviar Arquivos
              </Button>
              {files.length > 0 && (
                <Button type="button" variant="outline" onClick={handleClear}>
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
