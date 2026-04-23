'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Link2,
  Loader2,
  Paperclip,
  Trash2,
  Video,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  downloadTicketAttachmentFile,
  fetchTicketAttachmentBlob,
} from '@/http/tickets/download-ticket-attachment'
import {
  completeTicketVideoAttachment,
  deleteTicketAttachment,
  getTicketAttachmentPlaybackUrl,
  putVideoToGcsSignedUrl,
  requestTicketVideoUploadUrl,
  type TicketAttachmentMultipartMetadata,
  type TicketAttachmentOut,
  uploadTicketAttachmentsMultipart,
} from '@/http/tickets/ticket-attachments'
import { isApiError } from '@/lib/api'

import styles from './ticket-detail.module.css'

const MAX_MULTIPART_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 512 * 1024 * 1024

const MULTIPART_ACCEPT = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

function isVideoAttachment(att: TicketAttachmentOut): boolean {
  return (att.content_type ?? '').toLowerCase().startsWith('video/')
}

function isImageAttachment(att: TicketAttachmentOut): boolean {
  return (att.content_type ?? '').toLowerCase().startsWith('image/')
}

function isPdfAttachment(att: TicketAttachmentOut): boolean {
  return (att.content_type ?? '').toLowerCase() === 'application/pdf'
}

function multipartFileAllowed(file: File): boolean {
  if (file.size > MAX_MULTIPART_BYTES) return false
  const t = file.type.toLowerCase()
  if (MULTIPART_ACCEPT.includes(t as (typeof MULTIPART_ACCEPT)[number]))
    return true
  const n = file.name.toLowerCase()
  return /\.(pdf|jpe?g|png|gif|webp|doc|docx)$/i.test(n)
}

function invalidateAttachmentQueries(
  qc: ReturnType<typeof useQueryClient>,
  ticketId: string,
) {
  Promise.all([
    qc.invalidateQueries({ queryKey: ['ticket', ticketId, 'servicos'] }),
    qc.invalidateQueries({ queryKey: ['ticket-attachments', ticketId] }),
    qc.invalidateQueries({ queryKey: ['ticket', ticketId] }),
  ]).catch(() => {})
}

type BlobPreviewState = {
  kind: 'image' | 'pdf'
  url: string
  filename: string
}

type Props = {
  ticketId: string
  title: string
  attachments: TicketAttachmentOut[]
  readOnly: boolean
  /** `null` = anexo geral do chamado (sem `metadata` no multipart / sem escopo no vídeo). */
  serviceScope: TicketAttachmentMultipartMetadata | null
  uploadBlocked?: boolean
  uploadBlockedMessage?: string
}

export function TicketServicoAnexos({
  ticketId,
  title,
  attachments,
  readOnly,
  serviceScope,
  uploadBlocked = false,
  uploadBlockedMessage = 'Guarde os serviços para anexar ficheiros a este serviço.',
}: Props) {
  const queryClient = useQueryClient()
  const multipartRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [blobPreview, setBlobPreview] = useState<BlobPreviewState | null>(null)
  const [videoOpen, setVideoOpen] = useState<{
    src: string
    filename: string
  } | null>(null)
  const [videoLoadingId, setVideoLoadingId] = useState<string | null>(null)
  const [videoCopyingId, setVideoCopyingId] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (blobPreview?.url) URL.revokeObjectURL(blobPreview.url)
    }
  }, [blobPreview?.url])

  const closeBlobPreview = useCallback(() => {
    setBlobPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
  }, [])

  const deleteMutation = useMutation({
    mutationFn: ({ attachmentId }: { attachmentId: string }) =>
      deleteTicketAttachment(ticketId, attachmentId),
    onSuccess: () => {
      invalidateAttachmentQueries(queryClient, ticketId)
      toast.success('Anexo removido.')
    },
    onError: (err: unknown) => {
      const msg = isApiError(err)
        ? (err.response?.data as { detail?: string } | undefined)?.detail
        : undefined
      toast.error(
        typeof msg === 'string' ? msg : 'Não foi possível excluir o anexo.',
      )
    },
    onSettled: () => setDeletingId(null),
  })

  const multipartMutation = useMutation({
    mutationFn: (files: File[]) =>
      uploadTicketAttachmentsMultipart(
        ticketId,
        files,
        serviceScope ?? undefined,
      ),
    onSuccess: () => {
      invalidateAttachmentQueries(queryClient, ticketId)
      toast.success(
        serviceScope ? 'Anexos enviados para o serviço.' : 'Anexos enviados.',
      )
      if (multipartRef.current) multipartRef.current.value = ''
    },
    onError: (err: unknown) => {
      const msg = isApiError(err)
        ? (err.response?.data as { detail?: string } | undefined)?.detail
        : undefined
      toast.error(
        typeof msg === 'string' ? msg : 'Não foi possível enviar os anexos.',
      )
    },
  })

  const videoMutation = useMutation({
    mutationFn: async (file: File) => {
      const contentType = file.type || 'video/mp4'
      const scope =
        serviceScope != null
          ? {
              service_type: serviceScope.service_type,
              service_id: serviceScope.service_id,
            }
          : {}
      const uploadMeta = await requestTicketVideoUploadUrl(ticketId, {
        filename: file.name,
        content_type: contentType,
        file_size: file.size,
        resumable: true,
        ...scope,
      })
      await putVideoToGcsSignedUrl(uploadMeta.signed_url, file, contentType)
      await completeTicketVideoAttachment(ticketId, {
        storage_key: uploadMeta.storage_key,
        filename: file.name,
        content_type: contentType,
        size_bytes: file.size,
        ...scope,
      })
    },
    onSuccess: () => {
      invalidateAttachmentQueries(queryClient, ticketId)
      toast.success(
        serviceScope
          ? 'Vídeo anexado ao serviço.'
          : 'Vídeo anexado ao chamado.',
      )
      if (videoRef.current) videoRef.current.value = ''
    },
    onError: (err: unknown) => {
      if (err instanceof Error && !isApiError(err)) {
        toast.error(err.message)
        return
      }
      const msg = isApiError(err)
        ? (err.response?.data as { detail?: string } | undefined)?.detail
        : undefined
      toast.error(
        typeof msg === 'string' ? msg : 'Não foi possível enviar o vídeo.',
      )
    },
  })

  const handleDelete = useCallback(
    (att: TicketAttachmentOut) => {
      const ok = window.confirm(
        `Remover o anexo "${att.filename}"? Esta ação não pode ser desfeita.`,
      )
      if (!ok) return
      setDeletingId(att.id)
      deleteMutation.mutate({ attachmentId: att.id })
    },
    [deleteMutation],
  )

  const handleDownload = useCallback(
    async (att: TicketAttachmentOut) => {
      try {
        await downloadTicketAttachmentFile(att, ticketId)
      } catch {
        toast.error('Não foi possível baixar o anexo.')
      }
    },
    [ticketId],
  )

  const handleOpenBlobPreview = useCallback(
    async (att: TicketAttachmentOut) => {
      try {
        const { blob, contentType } = await fetchTicketAttachmentBlob(
          ticketId,
          att.id,
        )
        const kind: 'image' | 'pdf' = contentType.startsWith('image/')
          ? 'image'
          : 'pdf'
        const url = URL.createObjectURL(blob)
        setBlobPreview((prev) => {
          if (prev?.url) URL.revokeObjectURL(prev.url)
          return { kind, url, filename: att.filename }
        })
      } catch {
        toast.error('Não foi possível carregar a pré-visualização.')
      }
    },
    [ticketId],
  )

  const handlePlayVideo = useCallback(
    async (att: TicketAttachmentOut) => {
      setVideoLoadingId(att.id)
      try {
        const { signed_url: signedUrl } = await getTicketAttachmentPlaybackUrl(
          ticketId,
          att.id,
        )
        setVideoOpen({ src: signedUrl, filename: att.filename })
      } catch {
        toast.error(
          'Não foi possível obter o link de reprodução. Se o vídeo não abrir, pode ser CORS no armazenamento.',
        )
      } finally {
        setVideoLoadingId(null)
      }
    },
    [ticketId],
  )

  /** URL assinada no GCS; pedimos o máximo permitido (120 min) para quem receber o link. */
  const handleCopyVideoLink = useCallback(
    async (att: TicketAttachmentOut) => {
      setVideoCopyingId(att.id)
      try {
        const { signed_url: signedUrl } = await getTicketAttachmentPlaybackUrl(
          ticketId,
          att.id,
          120,
        )
        await navigator.clipboard.writeText(signedUrl)
        toast.success(
          'Link copiado. É temporário (válido por cerca de 2 horas) e aponta para o armazenamento.',
        )
      } catch {
        toast.error(
          'Não foi possível copiar o link. Verifique a permissão da área de transferência ou tente de novo.',
        )
      } finally {
        setVideoCopyingId(null)
      }
    },
    [ticketId],
  )

  const onPickMultipart = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files
      if (!list?.length) return
      const files = Array.from(list)
      const bad = files.filter((f) => !multipartFileAllowed(f))
      if (bad.length) {
        toast.error(
          'Só PDF, imagens (JPEG, PNG, GIF, WebP) ou Word, até 10 MB cada. Vídeo: use “Enviar vídeo”.',
        )
        e.target.value = ''
        return
      }
      multipartMutation.mutate(files)
      e.target.value = ''
    },
    [multipartMutation],
  )

  const onPickVideo = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (!file.type.startsWith('video/')) {
        toast.error('Escolha um ficheiro de vídeo.')
        e.target.value = ''
        return
      }
      if (file.size > MAX_VIDEO_BYTES) {
        toast.error('O vídeo excede o limite de 512 MB.')
        e.target.value = ''
        return
      }
      videoMutation.mutate(file)
      e.target.value = ''
    },
    [videoMutation],
  )

  const busy =
    multipartMutation.isPending ||
    videoMutation.isPending ||
    deleteMutation.isPending

  const canUpload = !readOnly && !uploadBlocked && !busy

  return (
    <div className={styles.servicoAnexos}>
      <div className={styles.servicoAnexosHeader}>
        <Paperclip className={styles.servicoAnexosIcon} aria-hidden size={16} />
        <span className={styles.servicoAnexosTitle}>{title}</span>
      </div>

      {uploadBlocked && !readOnly ? (
        <p className={styles.servicoAnexosHint}>{uploadBlockedMessage}</p>
      ) : null}

      {canUpload ? (
        <div className={styles.servicoAnexosActions}>
          <input
            ref={multipartRef}
            type="file"
            className={styles.servicoAnexosFileInput}
            multiple
            accept={MULTIPART_ACCEPT.join(',')}
            onChange={onPickMultipart}
            aria-hidden
            tabIndex={-1}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2"
            onClick={() => multipartRef.current?.click()}
            disabled={multipartMutation.isPending}
          >
            {multipartMutation.isPending ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <FileText className="h-4 w-4 shrink-0" aria-hidden />
            )}
            Anexar ficheiros
          </Button>
          <input
            ref={videoRef}
            type="file"
            className={styles.servicoAnexosFileInput}
            accept="video/*"
            onChange={onPickVideo}
            aria-hidden
            tabIndex={-1}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2"
            onClick={() => videoRef.current?.click()}
            disabled={videoMutation.isPending}
          >
            {videoMutation.isPending ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <Video className="h-4 w-4 shrink-0" aria-hidden />
            )}
            Enviar vídeo
          </Button>
        </div>
      ) : null}

      {attachments.length === 0 ? (
        <p className={styles.servicoAnexosEmpty}>Nenhum anexo.</p>
      ) : (
        <div className={styles.docGrid}>
          {attachments.map((att) => {
            const video = isVideoAttachment(att)
            const image = isImageAttachment(att)
            const pdf = isPdfAttachment(att)
            return (
              <div key={att.id} className={styles.docCard}>
                <div className={styles.docCardLeft}>
                  <div className={styles.docPdfIcon} aria-hidden>
                    {video ? (
                      <Video size={20} />
                    ) : image ? (
                      <ImageIcon size={20} />
                    ) : (
                      <FileText size={20} />
                    )}
                  </div>
                  <div className={styles.docInfo}>
                    <p className={styles.docName} title={att.filename}>
                      {att.filename}
                    </p>
                    <p className={styles.docSize}>
                      {formatBytes(att.size_bytes)}
                    </p>
                  </div>
                </div>
                <div className={styles.docCardActions}>
                  {video ? (
                    <>
                      <button
                        type="button"
                        className={styles.docIconBtn}
                        aria-label={`Reproduzir ${att.filename}`}
                        title="Reproduzir"
                        onClick={() => {
                          handlePlayVideo(att).catch(() => {})
                        }}
                        disabled={
                          deletingId === att.id ||
                          videoLoadingId === att.id ||
                          videoCopyingId === att.id ||
                          busy
                        }
                      >
                        {videoLoadingId === att.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Video size={18} />
                        )}
                      </button>
                      <button
                        type="button"
                        className={styles.docIconBtn}
                        aria-label={`Copiar link do vídeo ${att.filename}`}
                        title="Copiar link para partilhar"
                        onClick={() => {
                          handleCopyVideoLink(att).catch(() => {})
                        }}
                        disabled={
                          deletingId === att.id ||
                          videoLoadingId === att.id ||
                          videoCopyingId === att.id ||
                          busy
                        }
                      >
                        {videoCopyingId === att.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Link2 size={18} />
                        )}
                      </button>
                    </>
                  ) : image || pdf ? (
                    <button
                      type="button"
                      className={styles.docIconBtn}
                      aria-label={`Ver ${att.filename}`}
                      title="Ver"
                      onClick={() => {
                        handleOpenBlobPreview(att).catch(() => {})
                      }}
                      disabled={deletingId === att.id || busy}
                    >
                      <Eye size={18} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={styles.docIconBtn}
                    aria-label={`Baixar ${att.filename}`}
                    title="Descarregar"
                    onClick={() => {
                      handleDownload(att).catch(() => {})
                    }}
                    disabled={deletingId === att.id || busy}
                  >
                    <Download size={18} />
                  </button>
                  {!readOnly ? (
                    <button
                      type="button"
                      className={styles.docIconBtn}
                      aria-label={`Remover ${att.filename}`}
                      title="Remover"
                      onClick={() => handleDelete(att)}
                      disabled={deletingId === att.id || busy}
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog
        open={!!blobPreview}
        onOpenChange={(o) => !o && closeBlobPreview()}
      >
        <DialogContent className={styles.servicoAnexosPreviewDialog}>
          <DialogHeader>
            <DialogTitle>
              {blobPreview?.filename ?? 'Pré-visualização'}
            </DialogTitle>
          </DialogHeader>
          {blobPreview?.kind === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blobPreview.url}
              alt=""
              className={styles.servicoAnexosPreviewImg}
            />
          ) : blobPreview?.kind === 'pdf' ? (
            <iframe
              title={blobPreview.filename}
              src={blobPreview.url}
              className={styles.servicoAnexosPreviewIframe}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!videoOpen} onOpenChange={(o) => !o && setVideoOpen(null)}>
        <DialogContent className={styles.servicoAnexosVideoDialog}>
          <DialogHeader>
            <DialogTitle>{videoOpen?.filename ?? 'Vídeo'}</DialogTitle>
          </DialogHeader>
          {videoOpen ? (
            <video
              controls
              playsInline
              className={styles.servicoAnexosVideo}
              src={videoOpen.src}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
