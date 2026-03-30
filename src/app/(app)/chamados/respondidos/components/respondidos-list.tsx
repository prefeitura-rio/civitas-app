'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Paperclip } from 'lucide-react'
import { useState } from 'react'

import tcStyles from '@/app/(app)/chamados/criar/ticket-create/ticket-create-form.module.css'
import { Pagination } from '@/components/ui/pagination'
import { useRespondidosSearchParams } from '@/hooks/useParams/useRespondidosSearchParams'
import { type EmailBase, getEmailsRespondidos } from '@/http/emails/get-emails'

import inboxStyles from '../../caixa-entrada/caixa-entrada.module.css'
import { EmailPreviewSheet } from '../../caixa-entrada/components/email-preview-sheet'

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

function RespondidosEmailRow({
  email,
  onOpen,
}: {
  email: EmailBase
  onOpen: (id: string) => void
}) {
  const date = resolveDate(email)

  return (
    <div className={inboxStyles.row}>
      <div className={inboxStyles.rowInner}>
        <input
          type="checkbox"
          className={inboxStyles.checkbox}
          aria-label="Selecionar e-mail"
        />
        <button
          type="button"
          className={inboxStyles.rowClickableMain}
          onClick={() => onOpen(email.id)}
        >
          <div className={inboxStyles.rowLeft}>
            <div className={inboxStyles.nameCol}>
              <p
                className={`${inboxStyles.cellText} ${inboxStyles.cellTextAwaiting}`}
              >
                {senderLabel(email)}
              </p>
            </div>
            <div className={inboxStyles.subjectCol}>
              <p
                className={`${inboxStyles.cellText} ${inboxStyles.cellTextAwaiting}`}
              >
                {rowPreview(email)}
              </p>
            </div>
          </div>
          <div className={inboxStyles.rowRight}>
            {email.has_attachments ? (
              <span title="Anexos">
                <Paperclip
                  className={inboxStyles.iconMuted}
                  size={16}
                  aria-hidden
                />
              </span>
            ) : (
              <span className={inboxStyles.attachmentSlot} aria-hidden />
            )}
            <p className={inboxStyles.dateText}>
              {date ? formatListDate(date) : '—'}
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}

export function RespondidosList() {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const { formattedSearchParams, queryKey, handlePaginate } =
    useRespondidosSearchParams()

  const { data: res, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      getEmailsRespondidos({
        page: formattedSearchParams.page,
        pageSize: formattedSearchParams.size,
      }),
    refetchInterval: 120_000,
  })

  const items = res?.data?.items ?? []
  const total = res?.data?.total ?? 0

  return (
    <>
      <EmailPreviewSheet
        open={selectedEmailId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEmailId(null)
        }}
        emailId={selectedEmailId}
        showMarkAsSpam={false}
      />

      <div className={inboxStyles.content}>
        <header className={inboxStyles.header}>
          <div>
            <h1 className={inboxStyles.title}>Respondidos</h1>
            <p className={inboxStyles.subtitle}>
              Listagem de e-mails que já receberam resposta.
            </p>
          </div>
        </header>

        <div className={`${tcStyles.root} ${inboxStyles.listsStack}`}>
          <div className={inboxStyles.tableWrap}>
            {isLoading && (
              <div className={inboxStyles.emptyState}>Carregando...</div>
            )}

            {!isLoading && items.length === 0 && (
              <div className={inboxStyles.emptyState}>
                Nenhum e-mail encontrado
              </div>
            )}

            {!isLoading &&
              items.map((email) => (
                <RespondidosEmailRow
                  key={email.id}
                  email={email}
                  onOpen={setSelectedEmailId}
                />
              ))}

            {total > 0 && (
              <div className={inboxStyles.sectionPagination}>
                <Pagination
                  page={formattedSearchParams.page}
                  total={total}
                  size={formattedSearchParams.size}
                  onPageChange={handlePaginate}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
