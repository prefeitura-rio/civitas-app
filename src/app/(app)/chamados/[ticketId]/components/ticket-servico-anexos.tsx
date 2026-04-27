'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Copy,
  Download,
  FileText,
  Loader2,
  Paperclip,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

import { downloadTicketAttachmentFile } from '@/http/tickets/download-ticket-attachment'
import {
  completeTicketVideoAttachment,
  deleteTicketAttachment,
  deleteTicketServiceAttachment,
  getTicketServiceAttachmentPlaybackUrl,
  putVideoToGcsSignedUrl,
  requestTicketVideoUploadUrl,
  type TicketAttachmentMultipartMetadata,
  type TicketAttachmentOut,
  uploadTicketServiceAttachmentsMultipart,
} from '@/http/tickets/ticket-attachments'
import { isApiError } from '@/lib/api'

import styles from '../ticket-detail.module.css'

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

function getApiDetailUnless500(err: unknown): string | null {
  if (!isApiError(err)) return null
  const status = err.response?.status
  if (status === 500) return null
  const detail = (err.response?.data as { detail?: unknown } | undefined)
    ?.detail
  return typeof detail === 'string' && detail.trim().length > 0 ? detail : null
}

function formatPlaybackExpiry(expiresAt: string): string {
  const date = new Date(expiresAt)
  if (Number.isNaN(date.getTime())) return 'Expiração inválida'
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type Props = {
  ticketId: string
  title: string
  attachments: TicketAttachmentOut[]
  readOnly: boolean
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
  const uploadRef = useRef<HTMLInputElement>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [videoCopyingId, setVideoCopyingId] = useState<string | null>(null)
  const [videoRefreshingId, setVideoRefreshingId] = useState<string | null>(
    null,
  )
  const [videoPlaybackOverrides, setVideoPlaybackOverrides] = useState<
    Record<string, { signedUrl?: string; expiresAt?: string }>
  >({})

  const deleteMutation = useMutation({
    mutationFn: ({ attachmentId }: { attachmentId: string }) =>
      serviceScope
        ? deleteTicketServiceAttachment(ticketId, attachmentId)
        : deleteTicketAttachment(ticketId, attachmentId),
    onSuccess: () => {
      invalidateAttachmentQueries(queryClient, ticketId)
      toast.success('Anexo removido.')
    },
    onError: (err: unknown) => {
      toast.error(
        getApiDetailUnless500(err) ?? 'Não foi possível excluir o anexo.',
      )
    },
    onSettled: () => setDeletingId(null),
  })

  const multipartMutation = useMutation({
    mutationFn: (files: File[]) =>
      uploadTicketServiceAttachmentsMultipart(
        ticketId,
        files,
        serviceScope ?? undefined,
      ),
    onSuccess: () => {
      invalidateAttachmentQueries(queryClient, ticketId)
      toast.success(
        serviceScope ? 'Anexos enviados para o serviço.' : 'Anexos enviados.',
      )
      if (uploadRef.current) uploadRef.current.value = ''
    },
    onError: (err: unknown) => {
      toast.error(
        getApiDetailUnless500(err) ?? 'Não foi possível enviar os anexos.',
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
      if (uploadRef.current) uploadRef.current.value = ''
    },
    onError: (err: unknown) => {
      if (err instanceof Error && !isApiError(err)) {
        toast.error(err.message)
        return
      }
      toast.error(
        getApiDetailUnless500(err) ?? 'Não foi possível enviar o vídeo.',
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
        await downloadTicketAttachmentFile(att, ticketId, {
          serviceAttachment: Boolean(serviceScope),
        })
      } catch {
        toast.error('Não foi possível baixar o anexo.')
      }
    },
    [serviceScope, ticketId],
  )

  const resolvePlaybackUrl = useCallback(
    (att: TicketAttachmentOut) =>
      videoPlaybackOverrides[att.id]?.signedUrl ??
      (
        att as TicketAttachmentOut & {
          playback?: { signed_url?: string | null } | null
        }
      ).playback?.signed_url ??
      '',
    [videoPlaybackOverrides],
  )

  const resolvePlaybackExpiresAt = useCallback(
    (att: TicketAttachmentOut) =>
      videoPlaybackOverrides[att.id]?.expiresAt ??
      (
        att as TicketAttachmentOut & {
          playback?: { expires_at?: string | null } | null
        }
      ).playback?.expires_at ??
      '',
    [videoPlaybackOverrides],
  )

  /** URL assinada no GCS; pedimos o máximo permitido (120 min) para quem receber o link. */
  const handleCopyVideoLink = useCallback(
    async (att: TicketAttachmentOut) => {
      const playbackUrl = resolvePlaybackUrl(att)
      if (!playbackUrl) {
        toast.error('Este vídeo ainda não possui link disponível para cópia.')
        return
      }
      setVideoCopyingId(att.id)
      try {
        await navigator.clipboard.writeText(playbackUrl)
        toast.success('Link do vídeo copiado.')
      } catch {
        toast.error(
          'Não foi possível copiar o link. Verifique a permissão da área de transferência ou tente de novo.',
        )
      } finally {
        setVideoCopyingId(null)
      }
    },
    [resolvePlaybackUrl],
  )

  const handleRefreshVideoLink = useCallback(
    async (att: TicketAttachmentOut) => {
      setVideoRefreshingId(att.id)
      try {
        const { signed_url: signedUrl } =
          await getTicketServiceAttachmentPlaybackUrl(ticketId, att.id, 120)
        const expiresAt = new Date(Date.now() + 120 * 60 * 1000).toISOString()
        setVideoPlaybackOverrides((prev) => ({
          ...prev,
          [att.id]: { signedUrl, expiresAt },
        }))
        toast.success('Link do vídeo atualizado.')
      } catch (err) {
        toast.error(
          getApiDetailUnless500(err) ??
            'Não foi possível atualizar o link do vídeo.',
        )
      } finally {
        setVideoRefreshingId(null)
      }
    },
    [ticketId],
  )

  const onPickUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files
      if (!list?.length) return
      const files = Array.from(list)

      const videoFiles = files.filter((f) => f.type.startsWith('video/'))
      const nonVideoFiles = files.filter((f) => !f.type.startsWith('video/'))

      if (videoFiles.length > 0 && nonVideoFiles.length > 0) {
        toast.error(
          'Envie vídeos separados dos demais anexos para usar o endpoint correto.',
        )
        e.target.value = ''
        return
      }

      if (videoFiles.length > 0) {
        const videoFile = videoFiles[0]
        if (videoFiles.length > 1) {
          toast.error('Envie apenas um vídeo por vez.')
          e.target.value = ''
          return
        }
        if (videoFile.size > MAX_VIDEO_BYTES) {
          toast.error('O vídeo excede o limite de 512 MB.')
          e.target.value = ''
          return
        }
        videoMutation.mutate(videoFile)
        e.target.value = ''
        return
      }

      const bad = nonVideoFiles.filter((f) => !multipartFileAllowed(f))
      if (bad.length || nonVideoFiles.length === 0) {
        toast.error(
          'Só PDF, imagens (JPEG, PNG, GIF, WebP) ou Word, até 10 MB cada.',
        )
        e.target.value = ''
        return
      }
      multipartMutation.mutate(nonVideoFiles)
      e.target.value = ''
    },
    [multipartMutation, videoMutation],
  )

  const busy =
    multipartMutation.isPending ||
    videoMutation.isPending ||
    deleteMutation.isPending

  const canUpload = !readOnly && !uploadBlocked && !busy
  const nonVideoAttachments = attachments.filter(
    (att) => !isVideoAttachment(att),
  )
  const videoAttachments = attachments.filter((att) => isVideoAttachment(att))

  return (
    <div
      className={`${styles.servicoAnexos}${readOnly ? ` ${styles.servicoAnexosReadOnly}` : ''}`}
    >
      <div className={styles.servicoAnexosHeader}>
        <span className={styles.servicoAnexosTitle}>{title}</span>
        {canUpload ? (
          <div className={styles.servicoAnexosHeaderActions}>
            <input
              ref={uploadRef}
              type="file"
              className={styles.servicoAnexosFileInput}
              multiple
              accept="video/*,.pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
              onChange={onPickUpload}
              aria-hidden
              tabIndex={-1}
            />
            <button
              type="button"
              className={styles.servicoAnexosIconButton}
              onClick={() => uploadRef.current?.click()}
              disabled={busy}
              title="Enviar anexo"
              aria-label="Enviar anexo"
            >
              {busy ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Paperclip size={18} />
              )}
            </button>
            <button
              type="button"
              className={styles.servicoAnexosIconButton}
              disabled
              title="Download em lote indisponível"
              aria-label="Download em lote indisponível"
            >
              <Download size={18} />
            </button>
          </div>
        ) : null}
      </div>

      {uploadBlocked && !readOnly ? (
        <p className={styles.servicoAnexosHint}>{uploadBlockedMessage}</p>
      ) : null}

      {attachments.length === 0 ? (
        <p className={styles.servicoAnexosEmpty}>Nenhum anexo.</p>
      ) : (
        <div className={styles.servicoAnexosList}>
          {nonVideoAttachments.length > 0 ? (
            <div className={styles.docGrid}>
              {nonVideoAttachments.map((att) => {
                return (
                  <div key={att.id} className={styles.docCard}>
                    <div className={styles.docCardLeft}>
                      <div className={styles.docPdfIcon} aria-hidden>
                        <FileText size={20} />
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
                        <Download size={16} />
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
                          <X size={16} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}

          {videoAttachments.length > 0 ? (
            <div className={styles.videoList}>
              {videoAttachments.map((att) => {
                const expiresAt = resolvePlaybackExpiresAt(att)
                const expiresDate = expiresAt ? new Date(expiresAt) : null
                const isExpired = expiresDate
                  ? expiresDate.getTime() <= Date.now()
                  : false
                const expiryText = expiresAt
                  ? `${isExpired ? 'Expirado em' : 'Expira em'} ${formatPlaybackExpiry(expiresAt)}`
                  : 'Expiração não informada'
                return (
                  <div key={att.id} className={styles.videoRow}>
                    <p className={styles.videoLabel}>Link do vídeo</p>
                    <div className={styles.videoActionsRow}>
                      <div
                        className={styles.videoUrlBox}
                        title={resolvePlaybackUrl(att)}
                      >
                        {resolvePlaybackUrl(att) || 'Link indisponível'}
                      </div>
                      <button
                        type="button"
                        className={styles.servicoAnexosIconButton}
                        aria-label={`Copiar link do vídeo ${att.filename}`}
                        title="Copiar link"
                        onClick={() => {
                          handleCopyVideoLink(att).catch(() => {})
                        }}
                        disabled={
                          deletingId === att.id ||
                          videoCopyingId === att.id ||
                          videoRefreshingId === att.id ||
                          busy
                        }
                      >
                        {videoCopyingId === att.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                      <button
                        type="button"
                        className={styles.servicoAnexosIconButton}
                        aria-label={`Atualizar link do vídeo ${att.filename}`}
                        title="Atualizar link"
                        onClick={() => {
                          handleRefreshVideoLink(att).catch(() => {})
                        }}
                        disabled={
                          deletingId === att.id ||
                          videoCopyingId === att.id ||
                          videoRefreshingId === att.id ||
                          busy
                        }
                      >
                        {videoRefreshingId === att.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <RefreshCw size={18} />
                        )}
                      </button>
                      {!readOnly ? (
                        <button
                          type="button"
                          className={styles.servicoAnexosIconButton}
                          aria-label={`Remover ${att.filename}`}
                          title="Remover"
                          onClick={() => handleDelete(att)}
                          disabled={deletingId === att.id || busy}
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : null}
                    </div>
                    <p
                      className={`${styles.videoExpiry} ${isExpired ? styles.videoExpiryExpired : ''}`}
                    >
                      {expiryText}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
