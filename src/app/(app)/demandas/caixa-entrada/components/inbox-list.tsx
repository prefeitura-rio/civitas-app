'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Paperclip, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import { Section } from '@/app/(app)/demandas/criar/components/shared/section'
import tcStyles from '@/app/(app)/demandas/criar/ticket-create/ticket-create-form.module.css'
import { Pagination } from '@/components/ui/pagination'
import { useCaixaEntradaSearchParams } from '@/hooks/useParams/useCaixaEntradaSearchParams'
import {
  type EmailBase,
  getEmailsAguardandoResposta,
  getEmailsNaoLidos,
} from '@/http/emails/get-emails'

import styles from '../caixa-entrada.module.css'
import { EmailPreviewSheet } from './email-preview-sheet'

/** Refetch das listas a cada 2 min (alinhado ao aviso no cabeçalho da página). */
const CAIXA_ENTRADA_REFETCH_MS = 2 * 60 * 1000

function resolveDate(email: EmailBase): Date | null {
  if (email.date) {
    const d = new Date(email.date)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (email.internal_date != null) {
    return new Date(email.internal_date)
  }
  return null
}

function formatListDate(d: Date): string {
  return format(d, "d 'de' MMM", { locale: ptBR })
}

function rowPreview(email: EmailBase): string {
  const s = email.subject?.trim()
  if (s) return s
  return email.snippet?.trim() || '—'
}

function senderLabel(email: EmailBase): string {
  return email.from_name?.trim() || email.from_address?.trim() || '—'
}

type RowVariant = 'nao-lidos' | 'aguardando'

function InboxEmailRow({
  email,
  variant,
  onOpen,
}: {
  email: EmailBase
  variant: RowVariant
  onOpen: (id: string) => void
}) {
  const date = resolveDate(email)
  const nameClass =
    variant === 'nao-lidos'
      ? `${styles.cellText} ${styles.cellTextUnread}`
      : `${styles.cellText} ${styles.cellTextAwaiting}`
  const subjectClass =
    variant === 'nao-lidos'
      ? `${styles.cellText} ${styles.cellTextUnread}`
      : `${styles.cellText} ${styles.cellTextAwaiting}`

  return (
    <div className={styles.row}>
      <div className={styles.rowInner}>
        <input
          type="checkbox"
          className={styles.checkbox}
          aria-label="Selecionar e-mail"
        />
        <button
          type="button"
          className={styles.rowClickableMain}
          onClick={() => onOpen(email.id)}
        >
          <div className={styles.rowLeft}>
            <div className={styles.nameCol}>
              <p className={nameClass}>{senderLabel(email)}</p>
            </div>
            <div className={styles.subjectCol}>
              <p className={subjectClass}>{rowPreview(email)}</p>
            </div>
          </div>
          <div className={styles.rowRight}>
            {email.has_attachments ? (
              <span title="Anexos">
                <Paperclip className={styles.iconMuted} size={16} aria-hidden />
              </span>
            ) : (
              <span className={styles.attachmentSlot} aria-hidden />
            )}
            <p
              className={
                variant === 'nao-lidos'
                  ? `${styles.dateText} ${styles.dateTextEmphasis}`
                  : styles.dateText
              }
            >
              {date ? formatListDate(date) : '—'}
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}

export function InboxList() {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [openNaoLidos, setOpenNaoLidos] = useState(true)
  const [openAguardando, setOpenAguardando] = useState(true)

  const { naoLidos, aguardando } = useCaixaEntradaSearchParams()

  const { data: resNaoLidos, isLoading: loadingNaoLidos } = useQuery({
    queryKey: naoLidos.queryKey,
    queryFn: () =>
      getEmailsNaoLidos({
        page: naoLidos.formattedSearchParams.page,
        pageSize: naoLidos.formattedSearchParams.size,
      }),
    refetchInterval: CAIXA_ENTRADA_REFETCH_MS,
  })

  const { data: resAguardando, isLoading: loadingAguardando } = useQuery({
    queryKey: aguardando.queryKey,
    queryFn: () =>
      getEmailsAguardandoResposta({
        page: aguardando.formattedSearchParams.page,
        pageSize: aguardando.formattedSearchParams.size,
      }),
    refetchInterval: CAIXA_ENTRADA_REFETCH_MS,
  })

  const itemsNaoLidos = resNaoLidos?.data?.items ?? []
  const totalNaoLidos = resNaoLidos?.data?.total ?? 0

  const itemsAguardando = resAguardando?.data?.items ?? []
  const totalAguardando = resAguardando?.data?.total ?? 0

  return (
    <>
      <EmailPreviewSheet
        open={selectedEmailId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEmailId(null)
        }}
        emailId={selectedEmailId}
      />

      <div className={styles.content}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Caixa de Entrada</h1>
            <p className={styles.subtitle}>
              Listagem de Emails não lidos e aguardando resposta.
            </p>
          </div>
          <div className={styles.infoBar}>
            <TriangleAlert className={styles.iconMuted} aria-hidden size={16} />
            <p className={styles.infoBarText}>
              Os e-mails são atualizados automaticamente a cada 2 minutos.
            </p>
          </div>
        </header>

        <div className={`${tcStyles.root} ${styles.listsStack}`}>
          <Section
            title={`Não lidos (${totalNaoLidos})`}
            isOpen={openNaoLidos}
            onToggle={() => setOpenNaoLidos((v) => !v)}
          >
            <div className={styles.tableWrap}>
              {loadingNaoLidos && (
                <div className={styles.emptyState}>Carregando...</div>
              )}

              {!loadingNaoLidos && itemsNaoLidos.length === 0 && (
                <div className={styles.emptyState}>
                  Nenhum e-mail encontrado
                </div>
              )}

              {!loadingNaoLidos &&
                itemsNaoLidos.map((email) => (
                  <InboxEmailRow
                    key={email.id}
                    email={email}
                    variant="nao-lidos"
                    onOpen={setSelectedEmailId}
                  />
                ))}

              {totalNaoLidos > 0 && (
                <div className={styles.sectionPagination}>
                  <Pagination
                    page={naoLidos.formattedSearchParams.page}
                    total={totalNaoLidos}
                    size={naoLidos.formattedSearchParams.size}
                    onPageChange={naoLidos.handlePaginate}
                  />
                </div>
              )}
            </div>
          </Section>

          <Section
            title={`Aguardando resposta (${totalAguardando})`}
            isOpen={openAguardando}
            onToggle={() => setOpenAguardando((v) => !v)}
          >
            <div className={styles.tableWrap}>
              {loadingAguardando && (
                <div className={styles.emptyState}>Carregando...</div>
              )}

              {!loadingAguardando && itemsAguardando.length === 0 && (
                <div className={styles.emptyState}>
                  Nenhum e-mail encontrado
                </div>
              )}

              {!loadingAguardando &&
                itemsAguardando.map((email) => (
                  <InboxEmailRow
                    key={email.id}
                    email={email}
                    variant="aguardando"
                    onOpen={setSelectedEmailId}
                  />
                ))}

              {totalAguardando > 0 && (
                <div className={styles.sectionPagination}>
                  <Pagination
                    page={aguardando.formattedSearchParams.page}
                    total={totalAguardando}
                    size={aguardando.formattedSearchParams.size}
                    onPageChange={aguardando.handlePaginate}
                  />
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}
