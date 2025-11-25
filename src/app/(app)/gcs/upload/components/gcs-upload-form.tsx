'use client'

import { useMutation } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  File,
  Upload,
  X,
} from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { generateUploadUrl } from '@/http/gcs/generate-upload-url'

import { formatFileSize, useUploadForm } from '../hooks/use-upload-form'
import { useUploadQueue } from '../hooks/use-upload-queue'

interface GcsUploadFormProps {
  bucketName: string
}

export function GcsUploadForm({ bucketName }: GcsUploadFormProps) {
  const { mutateAsync: generateUploadUrlMutation } = useMutation({
    mutationFn: generateUploadUrl,
  })
  const {
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
  } = useUploadQueue({
    bucketName,
    generateUploadUrl: generateUploadUrlMutation,
  })
  const {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    handleSubmit,
    handleClear,
    handleRetry,
    handleExportErrors,
  } = useUploadForm({
    files,
    addFiles,
    startUploads,
    retryErrorsAndStart,
    clearFiles,
  })

  return (
    <div className="mx-auto w-full max-w-[700px] space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivos para GCS</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-12rem)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  Arraste arquivos e/ou pastas aqui
                </p>
                <p className="mb-2 text-center text-xs text-muted-foreground">
                  Pastas mantêm hierarquia completa • Suporta múltiplos níveis
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    document.getElementById('file-input')?.click()
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Ou clique para selecionar arquivos
                </button>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Arquivos Selecionados ({files.length})</Label>
                <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border p-4">
                  {sortedFiles.map((fileWithProgress) => {
                    return (
                      <div
                        key={fileWithProgress.id}
                        className="flex items-center justify-between rounded border p-3"
                      >
                        <div className="flex flex-1 items-center gap-3">
                          <File className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {fileWithProgress.file.name}
                            </p>
                            {fileWithProgress.relativePath !==
                              fileWithProgress.file.name && (
                              <p className="truncate text-xs text-muted-foreground">
                                📁 {fileWithProgress.relativePath}
                              </p>
                            )}
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
                          onClick={() => removeFile(fileWithProgress.id)}
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

            {/* Error Alert */}
            {hasErrors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Falha no Upload</AlertTitle>
                <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {files.filter((f) => f.status === 'error').length}{' '}
                    arquivo(s) falharam ao enviar.
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-destructive-foreground/20 bg-destructive/10 text-destructive-foreground hover:bg-destructive/20"
                      onClick={handleRetry}
                    >
                      <Upload className="mr-2 h-3 w-3" />
                      Tentar Novamente
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-destructive-foreground/20 bg-destructive/10 text-destructive-foreground hover:bg-destructive/20"
                      onClick={handleExportErrors}
                    >
                      <Download className="mr-2 h-3 w-3" />
                      Exportar CSV
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
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
