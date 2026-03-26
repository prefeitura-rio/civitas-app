'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronRight, Paperclip, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import { Pagination } from '@/components/ui/pagination'
import { useCaixaEntradaSearchParams } from '@/hooks/useParams/useCaixaEntradaSearchParams'
import { type EmailBase, getEmails } from '@/http/emails/get-emails'

import styles from '../caixa-entrada.module.css'
import { EmailPreviewSheet } from './email-preview-sheet'

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

export function InboxList() {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)

  const { formattedSearchParams, queryKey, handlePaginate } =
    useCaixaEntradaSearchParams()

  const { data: response, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      getEmails({
        page: formattedSearchParams.page,
        pageSize: formattedSearchParams.size,
      }),
    refetchInterval: 120_000,
  })

  const items = response?.data?.items ?? []
  const total = response?.data?.total ?? 0

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
              Preencha as informações abaixo para criar um novo chamado.
            </p>
          </div>
          <div className={styles.infoBar}>
            <TriangleAlert className={styles.iconMuted} aria-hidden size={16} />
            <p className={styles.infoBarText}>
              Os e-mails são atualizados automaticamente a cada 2 minutos.
            </p>
          </div>
        </header>

        <div className={styles.tableWrap}>
          <div className={styles.tableToolbar}>
            <div className={styles.badgeGroup}>
              <span className={styles.badge}>Respondidos</span>
              <span className={styles.badgeCount}>{total}</span>
            </div>
            <ChevronRight
              className={styles.toolbarChevron}
              size={24}
              aria-hidden
            />
          </div>

          {isLoading && <div className={styles.emptyState}>Carregando...</div>}

          {!isLoading && items.length === 0 && (
            <div className={styles.emptyState}>Nenhum e-mail encontrado</div>
          )}

          {!isLoading &&
            items.map((email) => {
              const unread = !email.is_read
              const date = resolveDate(email)
              return (
                <div key={email.id} className={styles.row}>
                  <div className={styles.rowInner}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      aria-label="Selecionar e-mail"
                    />
                    <button
                      type="button"
                      className={styles.rowClickableMain}
                      onClick={() => setSelectedEmailId(email.id)}
                    >
                      <div className={styles.rowLeft}>
                        <div className={styles.nameCol}>
                          <p
                            className={`${styles.cellText} ${unread ? styles.cellTextUnread : ''}`}
                          >
                            {senderLabel(email)}
                          </p>
                        </div>
                        <div className={styles.subjectCol}>
                          <p
                            className={`${styles.cellText} ${unread ? styles.cellTextUnread : ''}`}
                          >
                            {rowPreview(email)}
                          </p>
                        </div>
                      </div>
                      <div className={styles.rowRight}>
                        {email.has_attachments ? (
                          <span title="Anexos">
                            <Paperclip
                              className={styles.iconMuted}
                              size={16}
                              aria-hidden
                            />
                          </span>
                        ) : (
                          <span className={styles.attachmentSlot} aria-hidden />
                        )}
                        <p className={styles.dateText}>
                          {date ? formatListDate(date) : '—'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {total > 0 && (
        <div className={styles.pagination}>
          <Pagination
            page={formattedSearchParams.page}
            total={total}
            size={formattedSearchParams.size}
            onPageChange={handlePaginate}
          />
        </div>
      )}
    </>
  )
}
