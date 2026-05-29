import type { SearchOption } from '@/http/tickets/tickets-dashboard-filters'

/** Alinhado ao `TicketStatus` do backend. */
export type TicketStatus =
  | 'PENDENTE'
  | 'AGUARDANDO_REVISAO_ADJUNTO'
  | 'AGUARDANDO_REVISAO_ADMINISTRATIVO'
  | 'FINALIZADO'
  | 'DEMANDA_RESPONDIDA'
  | 'BLOQUEADO'
  | 'RESTRITO'

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  PENDENTE: 'Pendente',
  AGUARDANDO_REVISAO_ADJUNTO: 'Aguardando revisão adjunto',
  AGUARDANDO_REVISAO_ADMINISTRATIVO: 'Aguardando revisão administrativo',
  FINALIZADO: 'Finalizado',
  DEMANDA_RESPONDIDA: 'Demanda respondida',
  BLOQUEADO: 'Bloqueado',
  RESTRITO: 'Restrito',
}

export const TICKET_STATUS_VALUES = Object.keys(
  TICKET_STATUS_LABELS,
) as TicketStatus[]

export function formatTicketStatusLabel(status: string): string {
  const normalized = status.trim().toUpperCase() as TicketStatus
  return TICKET_STATUS_LABELS[normalized] ?? status
}

/** `value` com `_` para a API; `label` legível sem `_`. */
export function toTicketStatusFilterOptions(): SearchOption[] {
  return TICKET_STATUS_VALUES.map((value) => ({
    value,
    label: TICKET_STATUS_LABELS[value],
  }))
}

export const TICKET_STATUS_FILTER_OPTIONS = toTicketStatusFilterOptions()
