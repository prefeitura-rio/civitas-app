'use client'

import { format, parseISO } from 'date-fns'
import { Tag } from 'lucide-react'
import Link from 'next/link'

import type { TicketShiftClosingItem } from '@/http/tickets/ticket-shift-closing'
import { dateConfig } from '@/lib/date-config'
import { cn } from '@/lib/utils'

import {
  getShiftClosingServiceTagClass,
  shiftClosingServiceTagStyles as tagStyles,
} from '../utils/service-tag-class'
import styles from './shift-closing-ticket-card.module.css'

function formatDateTime(value: string | null | undefined): string {
  if (!value?.trim()) return '—'
  try {
    return format(parseISO(value), dateConfig.formats.date, {
      locale: dateConfig.locale,
    })
  } catch {
    return value
  }
}

function formatPriority(priority: string | null | undefined) {
  const value = priority?.trim().toUpperCase()
  if (value === 'URGENTE') return 'Urgente'
  if (value === 'ALTA') return 'Alta'
  if (value === 'ROTINA') return 'Rotina'
  if (value === 'SEM PRIORIDADE') return 'Sem priority'
  return priority?.trim() || '—'
}

type DetailProps = {
  label: string
  value: string
  className?: string
}

function Detail({ label, value, className }: DetailProps) {
  return (
    <div className={cn(styles.detail, className)}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  )
}

type ShiftClosingTicketCardProps = {
  item: TicketShiftClosingItem
}

export function ShiftClosingTicketCard({ item }: ShiftClosingTicketCardProps) {
  const ticketLabel = item.ticket_number?.trim()
    ? `Chamado #${item.ticket_number}`
    : 'Chamado'

  return (
    <article className={styles.card}>
      <Link
        href={`/demandas/${encodeURIComponent(item.id)}`}
        className={styles.ticketBadge}
      >
        {ticketLabel}
      </Link>

      <div className={styles.details}>
        <Detail label="Status:" value={item.status || '—'} />
        <Detail label="Prioridade:" value={formatPriority(item.priority)} />
        <Detail label="Tipo:" value={item.ticket_type || '—'} />

        <Detail label="Equipe:" value={item.team || '—'} />
        <Detail
          label="Demandante:"
          value={item.requester_operation?.trim() || '—'}
        />
        <Detail label="Responsável:" value={item.assignee || '—'} />

        <Detail
          label="Data da Entrada:"
          value={formatDateTime(item.entry_at)}
        />
        <Detail label="Data do Email:" value={formatDateTime(item.email_at)} />
        <Detail
          label="Data de conclusão:"
          value={formatDateTime(item.completed_at)}
        />

        <Detail
          className={styles.detailFull}
          label="Nº de procedimento:"
          value={item.procedure_number?.trim() || '—'}
        />

        <div className={styles.servicesRow}>
          <span className={styles.detailLabel}>Serviços:</span>
          <div className={styles.servicesList}>
            {(item.services ?? []).length === 0 ? (
              <span className={styles.detailValue}>—</span>
            ) : (
              item.services.map((service, index) => (
                <span
                  key={`${item.id}-${service.label}-${index}`}
                  className={`${tagStyles.serviceTag} ${getShiftClosingServiceTagClass(service.label)}`}
                >
                  <Tag className={tagStyles.serviceTagIcon} strokeWidth={2} />
                  <span>{service.label}</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
