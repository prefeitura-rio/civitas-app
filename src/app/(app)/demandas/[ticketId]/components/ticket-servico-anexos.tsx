'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Copy,
  Download,
  Eye,
  FileText,
  Loader2,
  Paperclip,
  Pencil,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  downloadTicketAttachmentFile,
  fetchTicketAttachmentBlob,
  fetchTicketServiceAttachmentBlob,
} from '@/http/tickets/download-ticket-attachment'
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
import {
  gcsAttachmentLabel,
  isZipFile,
  resolveGcsUploadContentType,
  usesGcsSignedUrlAttachment,
  usesGcsSignedUrlUpload,
} from './ticket-gcs-upload'
import {
  getFilenameExtension,
  getPendingAttachmentBaseName,
  normalizePendingFilename,
  type PendingServiceAttachment,
  renamePendingAttachmentBase,
} from './ticket-pending-attachment'

export type { PendingServiceAttachment } from './ticket-pending-attachment'

const MAX_MULTIPART_BYTES = 10 * 1024 * 1024
const MAX_GCS_UPLOAD_GB = 20
const MAX_GCS_UPLOAD_BYTES = MAX_GCS_UPLOAD_GB * 1024 * 1024 * 1024
const MULTIPART_ACCEPT = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
] as const

const BLOCKED_DOCX = /\.docx$/i
const BLOCKED_MOV = /\.mov$/i

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

function multipartFileAllowed(file: File): boolean {
  if (usesGcsSignedUrlUpload(file)) return false
  if (file.size > MAX_MULTIPART_BYTES) return false
  const t = file.type.toLowerCase()
  if (MULTIPART_ACCEPT.includes(t as (typeof MULTIPART_ACCEPT)[number]))
    return true
  const n = file.name.toLowerCase()
  return /\.(pdf|jpe?g|png|gif|webp|doc)$/i.test(n)
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
  pendingFiles?: PendingServiceAttachment[]
  onQueuePendingFiles?: (files: File[]) => void
  onRenamePendingFile?: (index: number, filename: string) => void
  onRemovePendingFile?: (index: number) => void
}

export function TicketServicoAnexos({
  ticketId,
  title,
  attachments,
  readOnly,
  serviceScope,
  uploadBlocked = false,
  uploadBlockedMessage = 'Guarde os serviços para anexar ficheiros a este serviço.',
  pendingFiles = [],
  onQueuePendingFiles,
  onRenamePendingFile,
  onRemovePendingFile,
}: Props) {
  const queryClient = useQueryClient()
  const uploadRef = useRef<HTMLInputElement>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [videoCopyingId, setVideoCopyingId] = useState<string | null>(null)
  const [videoRefreshingId, setVideoRefreshingId] = useState<string | null>(
    null,
  )
  const [videoPlaybackOverrides, setVideoPlaybackOverrides] = useState<
    Record<string, { signedUrl?: string; expiresAt?: string }>
  >({})
  const [videoUploadUi, setVideoUploadUi] = useState<{
    fileName: string
    phase: 'preparing' | 'uploading' | 'finalizing'
    percent: number
  } | null>(null)
  const lastReportedVideoPercent = useRef(-1)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const [renameDialog, setRenameDialog] = useState<{
    index: number
    item: PendingServiceAttachment
    baseDraft: string
  } | null>(null)

  useEffect(() => {
    if (!renameDialog) return
    const t = window.setTimeout(() => renameInputRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [renameDialog])

  const openRenameDialog = useCallback(
    (index: number, item: PendingServiceAttachment) => {
      setRenameDialog({
        index,
        item,
        baseDraft: getPendingAttachmentBaseName(item),
      })
    },
    [],
  )

  const confirmRenameDialog = useCallback(() => {
    if (!renameDialog || !onRenamePendingFile) return
    const { index, item, baseDraft } = renameDialog
    onRenamePendingFile(
      index,
      normalizePendingFilename(
        renamePendingAttachmentBase(item, baseDraft),
        item.file.name,
      ),
    )
    setRenameDialog(null)
  }, [onRenamePendingFile, renameDialog])

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
    onMutate: (file) => {
      lastReportedVideoPercent.current = -1
      setVideoUploadUi({
        fileName: file.name,
        phase: 'preparing',
        percent: 0,
      })
    },
    mutationFn: async (file: File) => {
      const contentType = resolveGcsUploadContentType(file)
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
      setVideoUploadUi({
        fileName: file.name,
        phase: 'uploading',
        percent: 0,
      })
      lastReportedVideoPercent.current = 0
      await putVideoToGcsSignedUrl(uploadMeta.signed_url, file, contentType, {
        onProgress: ({ loaded, total }) => {
          const t = total > 0 ? total : file.size
          if (t <= 0) return
          const raw = Math.floor((loaded / t) * 100)
          const pct = Math.min(99, raw)
          if (pct === lastReportedVideoPercent.current) return
          lastReportedVideoPercent.current = pct
          setVideoUploadUi({
            fileName: file.name,
            phase: 'uploading',
            percent: pct,
          })
        },
      })
      setVideoUploadUi({
        fileName: file.name,
        phase: 'finalizing',
        percent: 100,
      })
      await completeTicketVideoAttachment(ticketId, {
        storage_key: uploadMeta.storage_key,
        filename: file.name,
        content_type: contentType,
        size_bytes: file.size,
        ...scope,
      })
    },
    onSuccess: (_data, file) => {
      invalidateAttachmentQueries(queryClient, ticketId)
      const kind = isZipFile(file) ? 'ZIP' : 'Vídeo'
      toast.success(
        serviceScope
          ? `${kind} anexado ao serviço.`
          : `${kind} anexado à demanda.`,
      )
      if (uploadRef.current) uploadRef.current.value = ''
    },
    onError: (err: unknown) => {
      if (err instanceof Error && !isApiError(err)) {
        toast.error(err.message)
        return
      }
      toast.error(
        getApiDetailUnless500(err) ??
          'Não foi possível enviar o ficheiro (vídeo ou ZIP).',
      )
    },
    onSettled: () => {
      setVideoUploadUi(null)
      lastReportedVideoPercent.current = -1
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

  const handleView = useCallback(
    async (att: TicketAttachmentOut) => {
      try {
        setViewingId(att.id)
        const { blob, contentType } = serviceScope
          ? await fetchTicketServiceAttachmentBlob(ticketId, att.id)
          : await fetchTicketAttachmentBlob(ticketId, att.id)
        const previewBlob = new Blob([blob], { type: contentType })
        const previewUrl = URL.createObjectURL(previewBlob)
        window.open(previewUrl, '_blank', 'noopener,noreferrer')
        window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000)
      } catch {
        toast.error('Não foi possível visualizar o anexo.')
      } finally {
        setViewingId(null)
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

  const handleCopyVideoLink = useCallback(
    async (att: TicketAttachmentOut) => {
      const playbackUrl = resolvePlaybackUrl(att)
      const kind = gcsAttachmentLabel(att).toLowerCase()
      if (!playbackUrl) {
        toast.error(`Este ${kind} ainda não possui link disponível para cópia.`)
        return
      }
      setVideoCopyingId(att.id)
      try {
        await navigator.clipboard.writeText(playbackUrl)
        toast.success(`Link do ${kind} copiado.`)
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
        const { signed_url: signedUrl, expires_at: expiresAt } =
          await getTicketServiceAttachmentPlaybackUrl(ticketId, att.id)
        setVideoPlaybackOverrides((prev) => ({
          ...prev,
          [att.id]: { signedUrl, expiresAt },
        }))
        toast.success(
          `Link do ${gcsAttachmentLabel(att).toLowerCase()} atualizado.`,
        )
      } catch (err) {
        toast.error(
          getApiDetailUnless500(err) ??
            'Não foi possível atualizar o link do anexo.',
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

      const hasDocx = files.some((f) => BLOCKED_DOCX.test(f.name))
      const hasMov = files.some((f) => BLOCKED_MOV.test(f.name))
      if (hasDocx || hasMov) {
        if (hasDocx && hasMov) {
          toast.error('Ficheiros DOCX e MOV não são permitidos.')
        } else if (hasDocx) {
          toast.error('Ficheiros DOCX não são permitidos. Use o formato .doc.')
        } else {
          toast.error('Ficheiros MOV não são permitidos.')
        }
        e.target.value = ''
        return
      }

      const gcsFiles = files.filter(usesGcsSignedUrlUpload)
      const otherFiles = files.filter((f) => !usesGcsSignedUrlUpload(f))

      if (gcsFiles.length > 0 && otherFiles.length > 0) {
        toast.error(
          'Envie vídeos ou ZIP separados dos demais anexos para usar o endpoint correto.',
        )
        e.target.value = ''
        return
      }

      if (gcsFiles.length > 0) {
        const gcsFile = gcsFiles[0]
        if (gcsFiles.length > 1) {
          toast.error('Envie apenas um vídeo ou ZIP por vez.')
          e.target.value = ''
          return
        }
        if (gcsFile.size > MAX_GCS_UPLOAD_BYTES) {
          const label = isZipFile(gcsFile) ? 'O ZIP' : 'O vídeo'
          toast.error(`${label} excede o limite de ${MAX_GCS_UPLOAD_GB} GB.`)
          e.target.value = ''
          return
        }
        if (uploadBlocked && onQueuePendingFiles) {
          onQueuePendingFiles(gcsFiles)
          const pendingLabel = isZipFile(gcsFile) ? 'ZIP' : 'Vídeo'
          toast.success(
            `${pendingLabel} adicionado. Será enviado após guardar serviços.`,
          )
          e.target.value = ''
          return
        }
        videoMutation.mutate(gcsFile)
        e.target.value = ''
        return
      }

      const bad = otherFiles.filter((f) => !multipartFileAllowed(f))
      if (bad.length || otherFiles.length === 0) {
        toast.error(
          'Só PDF, imagens (JPEG, PNG, GIF, WebP) ou Word (.doc), até 10 MB cada.',
        )
        e.target.value = ''
        return
      }

      if (uploadBlocked && onQueuePendingFiles) {
        onQueuePendingFiles(files)
        toast.success(
          'Anexos adicionados. Serão enviados após guardar serviços.',
        )
        e.target.value = ''
        return
      }

      multipartMutation.mutate(otherFiles)
      e.target.value = ''
    },
    [multipartMutation, onQueuePendingFiles, uploadBlocked, videoMutation],
  )

  const busy =
    multipartMutation.isPending ||
    videoMutation.isPending ||
    deleteMutation.isPending

  const canUpload =
    !readOnly && !busy && (!uploadBlocked || !!onQueuePendingFiles)
  const multipartAttachments = attachments.filter(
    (att) => !usesGcsSignedUrlAttachment(att),
  )
  const gcsUploadAttachments = attachments.filter(usesGcsSignedUrlAttachment)

  const renameLockedExtension = renameDialog
    ? getFilenameExtension(renameDialog.item.file.name)
    : ''

  return (
    <>
      <div className={styles.servicoAnexos}>
        <div className={styles.servicoAnexosHeader}>
          <span className={styles.servicoAnexosTitle}>{title}</span>
          {canUpload ? (
            <div className={styles.servicoAnexosHeaderActions}>
              <input
                ref={uploadRef}
                type="file"
                className={styles.servicoAnexosFileInput}
                multiple
                accept="video/*,.zip,application/zip,.pdf,.jpg,.jpeg,.png,.gif,.webp,.doc"
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

        {videoUploadUi ? (
          <div
            className={styles.servicoAnexosUploadProgress}
            role="status"
            aria-live="polite"
            aria-busy={videoMutation.isPending}
          >
            <div className={styles.servicoAnexosUploadProgressTop}>
              <span className={styles.servicoAnexosUploadProgressLabel}>
                {videoUploadUi.phase === 'preparing' && 'A preparar envio…'}
                {videoUploadUi.phase === 'uploading' &&
                  `A enviar — ${videoUploadUi.percent}%`}
                {videoUploadUi.phase === 'finalizing' &&
                  'A concluir no servidor…'}
              </span>
              <span
                className={styles.servicoAnexosUploadProgressName}
                title={videoUploadUi.fileName}
              >
                {videoUploadUi.fileName}
              </span>
            </div>
            <div
              className={`${styles.servicoAnexosUploadProgressTrack} ${
                videoUploadUi.phase === 'preparing'
                  ? styles.servicoAnexosUploadProgressIndeterminate
                  : ''
              }`}
            >
              <div
                className={styles.servicoAnexosUploadProgressFill}
                style={
                  videoUploadUi.phase === 'preparing'
                    ? undefined
                    : { width: `${videoUploadUi.percent}%` }
                }
              />
            </div>
          </div>
        ) : null}

        {uploadBlocked && !readOnly ? (
          <p className={styles.servicoAnexosHint}>
            {uploadBlockedMessage}
            {pendingFiles.length > 0
              ? ` (${pendingFiles.length} pendente${pendingFiles.length > 1 ? 's' : ''})`
              : ''}
          </p>
        ) : null}

        {pendingFiles.length > 0 ? (
          <div className={styles.servicoAnexosList}>
            <div className={styles.docGrid}>
              {pendingFiles.map((item, index) => {
                const canRename = !readOnly && !!onRenamePendingFile
                const displayName = normalizePendingFilename(
                  item.filename,
                  item.file.name,
                )
                return (
                  <div key={item.id} className={styles.docCard}>
                    <div className={styles.docCardLeft}>
                      <div className={styles.docPdfIcon} aria-hidden>
                        <FileText size={20} />
                      </div>
                      <div
                        className={`${styles.docInfo} ${styles.servicoAnexosPendingDocInfo}`}
                      >
                        <p className={styles.docName} title={displayName}>
                          {displayName}
                        </p>
                        <p className={styles.docSize}>
                          {formatBytes(item.file.size)} - Pendente
                        </p>
                      </div>
                    </div>
                    <div className={styles.docCardActions}>
                      {canRename ? (
                        <button
                          type="button"
                          className={styles.docIconBtn}
                          aria-label={`Editar nome de ${displayName}`}
                          title="Editar nome"
                          onClick={() => openRenameDialog(index, item)}
                          disabled={busy}
                        >
                          <Pencil size={16} />
                        </button>
                      ) : null}
                      {!readOnly && onRemovePendingFile ? (
                        <button
                          type="button"
                          className={styles.docIconBtn}
                          aria-label={`Remover pendente ${displayName}`}
                          title="Remover pendente"
                          onClick={() => onRemovePendingFile(index)}
                          disabled={busy}
                        >
                          <X size={16} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        {attachments.length === 0 ? (
          <p className={styles.servicoAnexosEmpty}>Nenhum anexo.</p>
        ) : (
          <div className={styles.servicoAnexosList}>
            {multipartAttachments.length > 0 ? (
              <div className={styles.docGrid}>
                {multipartAttachments.map((att) => {
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
                          aria-label={`Visualizar ${att.filename}`}
                          title="Visualizar anexo"
                          onClick={() => {
                            handleView(att).catch(() => {})
                          }}
                          disabled={
                            deletingId === att.id ||
                            viewingId === att.id ||
                            busy
                          }
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.docIconBtn}
                          aria-label={`Baixar ${att.filename}`}
                          title="Descarregar"
                          onClick={() => {
                            handleDownload(att).catch(() => {})
                          }}
                          disabled={
                            deletingId === att.id ||
                            viewingId === att.id ||
                            busy
                          }
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
                            disabled={
                              deletingId === att.id ||
                              viewingId === att.id ||
                              busy
                            }
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

            {gcsUploadAttachments.length > 0 ? (
              <div className={styles.videoList}>
                {gcsUploadAttachments.map((att) => {
                  const playbackUrl = resolvePlaybackUrl(att)
                  const expiresAt = resolvePlaybackExpiresAt(att)
                  const expiresDate = expiresAt ? new Date(expiresAt) : null
                  const isExpired = expiresDate
                    ? expiresDate.getTime() <= Date.now()
                    : false
                  const expiryText = expiresAt
                    ? `${isExpired ? 'Expirado em' : 'Expira em'} ${formatPlaybackExpiry(expiresAt)}`
                    : 'Expiração não informada'
                  const kindLabel = gcsAttachmentLabel(att)
                  const displayName = att.filename?.trim() || kindLabel
                  return (
                    <div key={att.id} className={styles.videoRow}>
                      <p className={styles.videoLabel}>{kindLabel}</p>
                      <div className={styles.videoActionsRow}>
                        <div
                          className={styles.videoUrlBox}
                          title={playbackUrl || undefined}
                        >
                          {displayName}
                        </div>
                        <button
                          type="button"
                          className={styles.servicoAnexosIconButton}
                          aria-label={`Copiar link do ${kindLabel.toLowerCase()} ${displayName}`}
                          title={
                            playbackUrl
                              ? 'Copiar link'
                              : 'Link indisponível para cópia'
                          }
                          onClick={() => {
                            handleCopyVideoLink(att).catch(() => {})
                          }}
                          disabled={
                            !playbackUrl ||
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
                          aria-label={`Atualizar link do ${kindLabel.toLowerCase()} ${att.filename}`}
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

      <Dialog
        open={renameDialog !== null}
        onOpenChange={(open) => {
          if (!open) setRenameDialog(null)
        }}
      >
        <DialogContent className={styles.reassignDialogContent}>
          <div className={styles.reassignDialogInner}>
            <DialogHeader className={styles.reassignDialogHeader}>
              <DialogTitle className={styles.reassignDialogTitle}>
                Editar nome do anexo
              </DialogTitle>
            </DialogHeader>
            <div className={styles.reassignFields}>
              <div className={styles.reassignField}>
                <p className={styles.reassignFieldMessage}>
                  A extensão do ficheiro não pode ser alterada.
                </p>
              </div>
              <div className={styles.reassignField}>
                <span
                  className={styles.reassignLabel}
                  id="pending-attachment-rename-label"
                >
                  Nome
                </span>
                <div className={styles.reassignFilenameRow}>
                  <Input
                    ref={renameInputRef}
                    id="pending-attachment-rename"
                    type="text"
                    className={styles.reassignInput}
                    value={renameDialog?.baseDraft ?? ''}
                    onChange={(e) =>
                      setRenameDialog((prev) =>
                        prev ? { ...prev, baseDraft: e.target.value } : prev,
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        confirmRenameDialog()
                      }
                    }}
                    disabled={busy}
                    aria-labelledby="pending-attachment-rename-label"
                  />
                  {renameLockedExtension ? (
                    <span className={styles.reassignFilenameExt} aria-hidden>
                      {renameLockedExtension}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <DialogFooter
              className={`${styles.footerActions} ${styles.footerActionsCentered}`}
            >
              <button
                type="button"
                className={`${styles.footerBtn} ${styles.footerBtnDefault}`}
                onClick={() => setRenameDialog(null)}
                disabled={busy}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`${styles.footerBtn} ${styles.footerBtnPrimary}`}
                onClick={confirmRenameDialog}
                disabled={busy}
              >
                Guardar
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
