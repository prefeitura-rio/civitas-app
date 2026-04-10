'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Bold,
  ChevronLeft,
  Download,
  FileText,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import tcStyles from '@/app/(app)/chamados/criar/ticket-create/ticket-create-form.module.css'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { downloadEmailAttachmentFile } from '@/http/emails/download-email-attachment'
import { type AttachmentOut, getEmailById } from '@/http/emails/get-email'
import { sendStandardizedTemplatedEmail } from '@/http/emails/send-standardized-templated-email'
import {
  getStandardizedResponseById,
  listStandardizedResponses,
} from '@/http/standardized-responses/standardized-responses'
import { cn } from '@/lib/utils'

import styles from './responder-email-view.module.css'

/** Valor sentinela para o Select (sem POP) — não colidir com ids da API */
const EMPTY_POP_VALUE = '__civitas_pop_empty__'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

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

export function ResponderEmailView() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const emailId =
    typeof params?.emailId === 'string' ? params.emailId : undefined

  const [selectedPopId, setSelectedPopId] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')

  const sendMutation = useMutation({
    mutationFn: sendStandardizedTemplatedEmail,
    onSuccess: () => {
      toast.success('E-mail enviado.')
      queryClient.invalidateQueries({ queryKey: ['emails-inbox-nao-lidos'] })
      queryClient.invalidateQueries({
        queryKey: ['emails-inbox-aguardando-resposta'],
      })
      queryClient.invalidateQueries({ queryKey: ['email-detail', emailId] })
      router.push('/chamados/caixa-entrada')
    },
    onError: () => {
      toast.error('Não foi possível enviar o e-mail.')
    },
  })

  const {
    data: emailRes,
    isLoading: emailLoading,
    isError: emailError,
  } = useQuery({
    queryKey: ['email-detail', emailId],
    queryFn: () => getEmailById(emailId!),
    enabled: Boolean(emailId),
  })

  const email = emailRes?.data

  const { data: popsRes, isLoading: popsLoading } = useQuery({
    queryKey: ['standardized-responses', 'list', { isActive: true }],
    queryFn: async () => {
      const r = await listStandardizedResponses({ isActive: true })
      return r.data
    },
  })

  const pops = popsRes?.items ?? []

  const {
    data: popDetailRes,
    isFetching: popDetailLoading,
    isError: popDetailError,
  } = useQuery({
    queryKey: ['standardized-response', selectedPopId],
    queryFn: async () => {
      const r = await getStandardizedResponseById(selectedPopId!)
      return r.data
    },
    enabled: Boolean(selectedPopId),
    retry: false,
  })

  useEffect(() => {
    if (popDetailError) {
      toast.error('Não foi possível carregar a resposta padronizada.')
    }
  }, [popDetailError])

  useEffect(() => {
    if (!selectedPopId) {
      setReplyBody('')
      return
    }
    if (popDetailRes?.body != null) {
      setReplyBody(popDetailRes.body)
    }
  }, [selectedPopId, popDetailRes?.body])

  const selectedPopLabel = useMemo(() => {
    if (!selectedPopId) return null
    const row = pops.find((p) => p.id === selectedPopId)
    return row?.title ?? popDetailRes?.title ?? null
  }, [selectedPopId, pops, popDetailRes?.title])

  const selectedPopTitleForSend = selectedPopLabel?.trim() ?? ''

  const canSend =
    Boolean(emailId) &&
    Boolean(selectedPopId) &&
    selectedPopTitleForSend.length > 0 &&
    replyBody.trim().length > 0 &&
    !sendMutation.isPending

  const handleSend = useCallback(() => {
    if (!emailId || !selectedPopId) return
    const title = selectedPopTitleForSend
    if (!title || !replyBody.trim()) return
    sendMutation.mutate({
      email_id: emailId,
      title,
      body: replyBody,
    })
  }, [
    emailId,
    selectedPopId,
    selectedPopTitleForSend,
    replyBody,
    sendMutation.mutate,
  ])

  const handleDownload = useCallback(
    async (a: AttachmentOut) => {
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

  if (!emailId) {
    return (
      <div className={styles.root}>
        <div className={styles.errorBox}>E-mail inválido.</div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.main}>
        {emailLoading && (
          <div className={styles.loadingBox}>Carregando e-mail…</div>
        )}

        {emailError && !emailLoading && (
          <div className={styles.errorBox}>
            Não foi possível carregar o e-mail.
          </div>
        )}

        {!emailLoading && !emailError && email && (
          <div className={styles.visEmail}>
            <div className={styles.headerBar}>
              <div className={styles.headerLeft}>
                <Link
                  href="/chamados/caixa-entrada"
                  className={styles.backLink}
                  aria-label="Voltar para caixa de entrada"
                >
                  <ChevronLeft size={16} strokeWidth={2} aria-hidden />
                </Link>
                <h1 className={styles.pageTitle}>{subject}</h1>
              </div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.senderBlock}>
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
              <div className={styles.timeBlock}>
                <span>{timeStr}</span>
                <span>{dateStr}</span>
              </div>
            </div>

            <div className={styles.bodyCard}>
              <p className={styles.bodyText}>{body}</p>
            </div>

            {email.attachments.length > 0 ? (
              <div className={styles.attachmentsRow}>
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
            ) : null}

            <div className={`${styles.popField} space-y-1.5`}>
              <Label className={tcStyles.fieldLabel}>POP de respostas</Label>
              <Select
                value={selectedPopId ?? EMPTY_POP_VALUE}
                onValueChange={(v) =>
                  setSelectedPopId(v === EMPTY_POP_VALUE ? null : v)
                }
                disabled={popsLoading}
              >
                <SelectTrigger
                  className={cn(tcStyles.inputBg, styles.popSelectTrigger)}
                  aria-label="Resposta padronizada (POP)"
                >
                  <SelectValue placeholder="Selecione um pop" />
                </SelectTrigger>
                <SelectContent className={tcStyles.selectContentForm}>
                  <SelectItem
                    value={EMPTY_POP_VALUE}
                    className={tcStyles.selectItemForm}
                  >
                    Selecione um pop
                  </SelectItem>
                  {pops.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      className={tcStyles.selectItemForm}
                    >
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.editorWrap}>
              <div className={styles.toolbar} aria-hidden>
                <button type="button" className={styles.toolbarBtn} disabled>
                  <Bold size={16} />
                </button>
                <button type="button" className={styles.toolbarBtn} disabled>
                  <Italic size={16} />
                </button>
                <button type="button" className={styles.toolbarBtn} disabled>
                  <Underline size={16} />
                </button>
                <span className={styles.toolbarDivider} />
                <button type="button" className={styles.toolbarBtn} disabled>
                  <List size={16} />
                </button>
                <button type="button" className={styles.toolbarBtn} disabled>
                  <ListOrdered size={16} />
                </button>
                <span className={styles.toolbarDivider} />
                <button type="button" className={styles.toolbarBtn} disabled>
                  <Link2 size={16} />
                </button>
              </div>
              <textarea
                className={styles.textarea}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder={
                  popDetailLoading
                    ? 'Carregando texto do POP…'
                    : 'Digite sua resposta ou selecione um POP acima'
                }
                disabled={popDetailLoading && Boolean(selectedPopId)}
                spellCheck
              />
            </div>
          </div>
        )}

        {!emailLoading && !emailError && email ? (
          <div className={styles.footer}>
            <Link href="/chamados/caixa-entrada" className={styles.btnCancel}>
              Cancelar
            </Link>
            <button
              type="button"
              className={styles.btnSend}
              disabled={!canSend}
              title={
                !selectedPopId
                  ? 'Selecione um POP de respostas'
                  : !replyBody.trim()
                    ? 'Digite ou carregue o texto da resposta'
                    : undefined
              }
              onClick={handleSend}
            >
              {sendMutation.isPending ? 'Enviando…' : 'Enviar email'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
