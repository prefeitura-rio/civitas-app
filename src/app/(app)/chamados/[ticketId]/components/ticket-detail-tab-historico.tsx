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
        Não foi possível carregar o histórico de logs do chamado.
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
        <p className={styles.historicoTitle}>Histórico de logs do chamado:</p>
      </div>
      <ul
        className={styles.historicoList}
        aria-label="Linha do tempo do chamado"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const nome = (item.autor_nome || '').trim() || '—'
          const papel = (item.autor_papeis[0] || '').trim()
          const acaoRaw = (item.acao || '').trim()
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
                <div className={styles.historicoTextRow}>
                  <span className={styles.historicoNameGroup}>
                    <span className={styles.historicoName}>{nome}</span>
                    {papel ? (
                      <span
                        className={`${styles.parecerBadge} ${badgeClassForPapel(papel)}`}
                      >
                        {papel}
                      </span>
                    ) : null}
                  </span>
                  {acaoRaw ? (
                    <span className={styles.historicoAction}>
                      {acaoRaw.startsWith('-')
                        ? ` ${acaoRaw}`
                        : ` - ${acaoRaw}`}
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
