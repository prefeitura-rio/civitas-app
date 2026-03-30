'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Download, FileText, Square, User, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { downloadEmailAttachmentFile } from '@/http/emails/download-email-attachment'
import { type AttachmentOut, getEmailById } from '@/http/emails/get-email'
import { markEmailAsSpam } from '@/http/emails/mark-email-spam'
import { cn } from '@/lib/utils'

import styles from './email-preview-sheet.module.css'

function resolveEmailDate(email: {
  date?: string | null
  internal_date?: number | null
}): Date | null {
  if (email.date) {
    const d = new Date(email.date)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (email.internal_date != null) {
    return new Date(email.internal_date)
  }
  return null
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

export interface EmailPreviewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  emailId: string | null
  /** Só na caixa de entrada; em pastas como respondidos/spam não exibe marcar spam. */
  showMarkAsSpam?: boolean
}

export function EmailPreviewSheet({
  open,
  onOpenChange,
  emailId,
  showMarkAsSpam = true,
}: EmailPreviewSheetProps) {
  const queryClient = useQueryClient()
  const [spamConfirmOpen, setSpamConfirmOpen] = useState(false)

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['email-detail', emailId],
    queryFn: () => getEmailById(emailId!),
    enabled: open && !!emailId,
  })

  const email = response?.data

  const markSpamMutation = useMutation({
    mutationFn: () => markEmailAsSpam(emailId!),
    onSuccess: () => {
      toast.success('E-mail marcado como spam.')
      queryClient.invalidateQueries({ queryKey: ['emails-inbox-nao-lidos'] })
      queryClient.invalidateQueries({
        queryKey: ['emails-inbox-aguardando-resposta'],
      })
      queryClient.invalidateQueries({ queryKey: ['emails-spam'] })
      queryClient.invalidateQueries({ queryKey: ['email-detail', emailId] })
      setSpamConfirmOpen(false)
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Não foi possível marcar o e-mail como spam.')
    },
  })

  const handleDownload = useCallback(
    async (a: Parameters<typeof downloadEmailAttachmentFile>[0]) => {
      if (!emailId) return
      try {
        await downloadEmailAttachmentFile(a, emailId)
      } catch {
        toast.error('Não foi possível baixar o anexo.')
      }
    },
    [emailId],
  )

  const subject = email?.subject?.trim() || 'Sem assunto'
  const fromName = email?.from_name?.trim() || '—'
  const fromAddr = email?.from_address?.trim()
  const body = email?.body_preview?.trim() || email?.snippet?.trim() || '—'

  const d = email ? resolveEmailDate(email) : null
  const timeStr = d ? format(d, 'HH:mm', { locale: ptBR }) : '—'
  const dateStr = d ? format(d, 'dd/MM/yyyy', { locale: ptBR }) : '—'

  const replyHref =
    fromAddr &&
    `mailto:${encodeURIComponent(fromAddr)}?subject=${encodeURIComponent(`Re: ${email?.subject || ''}`)}`
  const convertHref =
    emailId != null
      ? `/chamados/converter?email_id=${encodeURIComponent(emailId)}`
      : '/chamados/converter'

  return (
    <>
      {showMarkAsSpam ? (
        <AlertDialog open={spamConfirmOpen} onOpenChange={setSpamConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Marcar como spam?</AlertDialogTitle>
              <AlertDialogDescription>
                O e-mail será movido para a pasta de spam. Você poderá revisá-lo
                depois na área de spam.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={markSpamMutation.isPending}
                onClick={() => markSpamMutation.mutate()}
              >
                {markSpamMutation.isPending ? 'Marcando…' : 'Marcar como spam'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          aria-describedby={undefined}
          className={cn(
            styles.sheetContent,
            'border-l sm:max-w-none',
            '[&>button:last-child]:hidden',
          )}
        >
          <SheetTitle className="sr-only">
            Pré-visualização do e-mail
          </SheetTitle>
          {isLoading && <div className={styles.loadingBox}>Carregando...</div>}
          {isError && !isLoading && (
            <div className={styles.errorBox}>
              Não foi possível carregar o e-mail.
            </div>
          )}
          {!isLoading && !isError && email && (
            <div className={styles.sheetInner}>
              <div className={styles.headerBlock}>
                <div className={styles.titleRow}>
                  <h2 className={styles.sheetTitle}>{subject}</h2>
                  <SheetClose asChild>
                    <button
                      type="button"
                      className={styles.closeBtn}
                      aria-label="Fechar"
                    >
                      <X size={24} strokeWidth={2} />
                    </button>
                  </SheetClose>
                </div>

                <div className={styles.metaRow}>
                  <div className={styles.senderLeft}>
                    <div className={styles.avatar}>
                      <User size={16} aria-hidden />
                    </div>
                    <div className={styles.senderText}>
                      <p className={styles.senderName}>{fromName}</p>
                      {fromAddr ? (
                        <p className={styles.senderEmail}>&lt;{fromAddr}&gt;</p>
                      ) : null}
                    </div>
                  </div>
                  <div className={styles.metaTime}>
                    <span>{timeStr}</span>
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>

              <div className={styles.actionsRow}>
                {showMarkAsSpam ? (
                  <button
                    type="button"
                    className={styles.tagSpam}
                    onClick={() => setSpamConfirmOpen(true)}
                    disabled={markSpamMutation.isPending}
                  >
                    <Square size={16} aria-hidden />
                    <span>SPAM</span>
                  </button>
                ) : null}
                {replyHref ? (
                  <a className={styles.btnSecondary} href={replyHref}>
                    Responder
                  </a>
                ) : (
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    disabled
                  >
                    Responder
                  </button>
                )}
                <Link href={convertHref} className={styles.btnPrimary}>
                  Converter em Chamado
                </Link>
              </div>

              <div className={styles.bodyCard}>
                <p className={styles.bodyText}>{body}</p>
              </div>

              {email.attachments.length > 0 ? (
                <div className={styles.attachmentsSection}>
                  <div className={styles.attachmentsList}>
                    {email.attachments.map((att: AttachmentOut) => (
                      <div key={att.id} className={styles.attachmentCard}>
                        <div className={styles.attachmentLeft}>
                          <div className={styles.pdfIconWrap}>
                            <FileText size={20} aria-hidden />
                          </div>
                          <div className={styles.attachmentInfo}>
                            <p
                              className={styles.attachmentName}
                              title={att.filename}
                            >
                              {att.filename}
                            </p>
                            <p className={styles.attachmentSize}>
                              {formatBytes(att.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.downloadBtn}
                          aria-label={`Baixar ${att.filename}`}
                          onClick={() => handleDownload(att)}
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
