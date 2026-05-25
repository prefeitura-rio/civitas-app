'use client'

import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'

import { getTicketLogs } from '@/http/tickets/ticket-logs'

import styles from '../ticket-detail.module.css'

type Props = {
  ticketId: string
}

function formatHistoricoTimestamp(iso: string): string {
  try {
    const d = parseISO(iso)
    return format(d, 'yyyy-MM-dd HH:mm')
  } catch {
    return '—'
  }
}

function badgeClassForPapel(papel: string): string {
  const p = papel.trim().toLowerCase()
  if (p.includes('operador')) return styles.parecerBadgeOperador
  if (p.includes('adjunto')) return styles.parecerBadgeAdjunto
  if (p.includes('administrativo')) return styles.parecerBadgeAdmin
  return styles.parecerBadgeDefault
}

/** Limite para exibir ação longa em bloco colapsável. */
const HISTORICO_ACAO_LONG_MIN_CHARS = 160

function formatAcaoDisplay(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('-') ? trimmed : `- ${trimmed}`
}

function isHistoricoAcaoLong(raw: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed) return false
  return (
    trimmed.includes('\n') || trimmed.length > HISTORICO_ACAO_LONG_MIN_CHARS
  )
}

function historicoAcaoSummaryLine(raw: string): string {
  const first = raw.trim().split('\n')[0]?.trim() ?? ''
  if (first.length <= 120) return first
  return `${first.slice(0, 117)}…`
}

function HistoricoAcao({ acaoRaw }: { acaoRaw: string }) {
  const text = formatAcaoDisplay(acaoRaw)
  if (!text) return null

  if (!isHistoricoAcaoLong(acaoRaw)) {
    return <p className={styles.historicoAction}>{text}</p>
  }

  return (
    <details className={styles.historicoActionDetails}>
      <summary className={styles.historicoActionSummary}>
        {historicoAcaoSummaryLine(acaoRaw)}
      </summary>
      <p className={styles.historicoActionBody}>{text}</p>
    </details>
  )
}

export function TicketDetailTabHistorico({ ticketId }: Props) {
  const query = useQuery({
    queryKey: ['ticket-logs', ticketId],
    queryFn: () => getTicketLogs(ticketId),
  })

  if (query.isLoading) {
    return <p className={styles.loading}>Carregando histórico…</p>
  }

  if (query.isError) {
    return (
      <p className={styles.error}>
        Não foi possível carregar o histórico de logs da demanda.
      </p>
    )
  }

  const items = query.data ?? []

  if (items.length === 0) {
    return (
      <p className={styles.historicoEmpty}>
        Nenhum registro no histórico ainda.
      </p>
    )
  }

  return (
    <div className={styles.historicoRoot}>
      <div className={styles.historicoHeader}>
        <p className={styles.historicoTitle}>Histórico de logs da demanda:</p>
      </div>
      <ul
        className={styles.historicoList}
        aria-label="Linha do tempo da demanda"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const autorNome = (item.autor_nome || '').trim()
          const papel = (item.autor_papeis[0] || '').trim()
          const acaoRaw = (item.acao || '').trim()
          const hasAuthor = Boolean(autorNome) || Boolean(papel)
          return (
            <li key={item.id} className={styles.historicoRow}>
              <div className={styles.historicoRail} aria-hidden>
                <span className={styles.historicoDot} />
                {!isLast ? <span className={styles.historicoLine} /> : null}
              </div>
              <div className={styles.historicoDetails}>
                <time
                  className={styles.historicoTime}
                  dateTime={item.criado_em}
                >
                  {formatHistoricoTimestamp(item.criado_em)}
                </time>
                <div className={styles.historicoEntry}>
                  {hasAuthor ? (
                    <div className={styles.historicoEntryHeader}>
                      <span className={styles.historicoName}>
                        {autorNome || '—'}
                      </span>
                      {papel ? (
                        <span
                          className={`${styles.parecerBadge} ${badgeClassForPapel(papel)}`}
                        >
                          {papel}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <HistoricoAcao acaoRaw={acaoRaw} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
