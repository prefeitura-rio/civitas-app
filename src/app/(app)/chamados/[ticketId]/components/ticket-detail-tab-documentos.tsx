'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Eye, FileText, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import {
  downloadTicketAttachmentFile,
  fetchTicketAttachmentBlob,
} from '@/http/tickets/download-ticket-attachment'
import {
  deleteTicketAttachment,
  getTicketAttachments,
} from '@/http/tickets/ticket-attachments'
import { isApiError } from '@/lib/api'

import styles from '../ticket-detail.module.css'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

type Props = {
  ticketId: string
}

export function TicketDetailTabDocumentos({ ticketId }: Props) {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)

  const attachmentsQuery = useQuery({
    queryKey: ['ticket-attachments', ticketId],
    queryFn: () => getTicketAttachments(ticketId),
  })

  const deleteMutation = useMutation({
    mutationFn: ({
      ticketId: tid,
      attachmentId,
    }: {
      ticketId: string
      attachmentId: string
    }) => deleteTicketAttachment(tid, attachmentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['ticket-attachments', ticketId],
      })
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      toast.success('Anexo removido.')
    },
    onError: (err: unknown) => {
      const msg = isApiError(err)
        ? (err.response?.data as { detail?: string } | undefined)?.detail
        : undefined
      toast.error(msg ?? 'Não foi possível excluir o anexo.')
    },
    onSettled: () => {
      setDeletingId(null)
    },
  })

  const handleDownload = useCallback(
    async (a: { id: string; filename: string }) => {
      try {
        await downloadTicketAttachmentFile(a, ticketId)
      } catch {
        toast.error('Não foi possível baixar o anexo.')
      }
    },
    [ticketId],
  )

  const handleView = useCallback(
    async (a: { id: string; filename: string }) => {
      try {
        setViewingId(a.id)
        const { blob, contentType } = await fetchTicketAttachmentBlob(
          ticketId,
          a.id,
        )
        const previewBlob = new Blob([blob], { type: contentType })
        const previewUrl = URL.createObjectURL(previewBlob)
        const newTab = window.open(previewUrl, '_blank', 'noopener,noreferrer')

        if (!newTab) {
          URL.revokeObjectURL(previewUrl)
          toast.error('Não foi possível abrir a visualização do anexo.')
          return
        }

        // Mantém a URL válida tempo suficiente para o navegador carregar o arquivo.
        window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000)
      } catch {
        toast.error('Não foi possível visualizar o anexo.')
      } finally {
        setViewingId(null)
      }
    },
    [ticketId],
  )

  const handleDelete = useCallback(
    (att: { id: string; filename: string }) => {
      const ok = window.confirm(
        `Remover o anexo "${att.filename}"? Esta ação não pode ser desfeita.`,
      )
      if (!ok) return
      setDeletingId(att.id)
      deleteMutation.mutate({ ticketId, attachmentId: att.id })
    },
    [deleteMutation, ticketId],
  )

  const anexos = attachmentsQuery.data ?? []

  if (attachmentsQuery.isLoading) {
    return (
      <div className={styles.fieldStack}>
        <div className={styles.docBlock}>
          <p className={styles.docEmpty}>Carregando documentos…</p>
        </div>
      </div>
    )
  }

  if (attachmentsQuery.isError) {
    return (
      <div className={styles.fieldStack}>
        <div className={styles.docBlock}>
          <p className={styles.docEmpty}>
            Não foi possível carregar os anexos. Tente novamente.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.fieldStack}>
      <div className={styles.docBlock}>
        <div>
          <p className={styles.docMainTitle} role="heading" aria-level={2}>
            Recibos enviados pelo demandante
          </p>
          <span className={styles.sectionHint}>
            Documentos que estavam anexado no email do requisitante.
          </span>
        </div>

        {anexos.length === 0 ? (
          <p className={styles.docEmpty}>Nenhum documento anexado.</p>
        ) : (
          <div className={styles.docGrid}>
            {anexos.map((att) => (
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
                    onClick={() => handleView(att)}
                    disabled={deletingId === att.id || viewingId === att.id}
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    type="button"
                    className={styles.docIconBtn}
                    aria-label={`Baixar ${att.filename}`}
                    onClick={() => handleDownload(att)}
                    disabled={deletingId === att.id || viewingId === att.id}
                  >
                    <Download size={18} />
                  </button>
                  <button
                    type="button"
                    className={styles.docIconBtn}
                    aria-label={`Remover ${att.filename}`}
                    title="Remover anexo"
                    onClick={() => handleDelete(att)}
                    disabled={deletingId === att.id || viewingId === att.id}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
