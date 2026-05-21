import { api } from '@/lib/api'

export type DemandVolumeGranularity = 'monthly' | 'weekly' | 'yearly'

export type DemandVolumeSummaryPeriod =
  | 'current_year'
  | 'current_month'
  | 'current_week'

export type TicketPriority = 'URGENTE' | 'ALTA' | 'ROTINA'

export type TicketStatus =
  | 'PENDENTE'
  | 'RESTRITO'
  | 'BLOQUEADO'
  | 'AGUARDANDO_REVISAO'
  | 'CONCLUIDO'

export interface DemandVolumeFilterIn {
  date_from?: string
  date_to?: string
  /** Afeta apenas summary (Total, Em aberto, Bloqueadas). Padrão: current_year */
  summary_period?: DemandVolumeSummaryPeriod
  requisitante?: string[]
  prioridade?: TicketPriority[]
  status?: TicketStatus[]
  tipo_chamado_id?: string[]
  relevante_imprensa?: boolean
}

export interface DemandVolumeSummaryOut {
  total: number
  open: number
  blocked: number
}

export interface PeriodValueItemOut {
  period_label: string
  count: number
  /** Média de referência para cor da célula (matrizes). Ausente/null em media_relevant_calls. */
  average?: number | null
}

export interface PeriodVolumeItemOut {
  period_label: string
  created: number
  closed: number
}

export interface PeriodUrgencyItemOut {
  period_label: string
  urgent: number
  high: number
  routine: number
}

export interface MatrixRowOut {
  label: string
  periods: PeriodValueItemOut[]
  total: number
}

export interface DemandVolumeGranularitySeries<T> {
  monthly: T[]
  weekly: T[]
  yearly: T[]
}

export function pickDemandVolumeGranularitySeries<T>(
  series: DemandVolumeGranularitySeries<T> | undefined,
  granularity: DemandVolumeGranularity,
): T[] {
  if (!series) return []
  return series[granularity] ?? []
}

export interface DemandVolumeOut {
  summary: DemandVolumeSummaryOut
  total_call_volume: DemandVolumeGranularitySeries<PeriodVolumeItemOut>
  closed_calls_by_urgency: DemandVolumeGranularitySeries<PeriodUrgencyItemOut>
  closed_calls_by_nature: MatrixRowOut[]
  closed_calls_by_service: MatrixRowOut[]
  media_relevant_calls: DemandVolumeGranularitySeries<PeriodValueItemOut>
  closed_calls_by_requester: MatrixRowOut[]
}

export function sanitizeDemandVolumeFilters(
  filters: DemandVolumeFilterIn,
): DemandVolumeFilterIn {
  const payload: DemandVolumeFilterIn = { ...filters }

  if (!payload.requisitante?.length) delete payload.requisitante
  if (!payload.prioridade?.length) delete payload.prioridade
  if (!payload.status?.length) delete payload.status
  if (!payload.tipo_chamado_id?.length) delete payload.tipo_chamado_id
  if (
    payload.relevante_imprensa !== true &&
    payload.relevante_imprensa !== false
  ) {
    delete payload.relevante_imprensa
  }

  return payload
}

export async function getDemandVolume(
  filters: DemandVolumeFilterIn,
): Promise<DemandVolumeOut> {
  const response = await api.post(
    '/ticket-dashboard/demand-volume',
    sanitizeDemandVolumeFilters(filters),
  )
  return response.data
}

export interface DemandVolumeTicketRefOut {
  id: string
  name?: string
  title?: string
}

export interface DemandVolumeTicketParentOut {
  id: string
  internal_number?: number
}

export interface DemandVolumeTicketItemOut {
  id: string
  internal_number: number
  created_at: string
  status: TicketStatus
  priority: TicketPriority
  requester_name: string
  operation: DemandVolumeTicketRefOut | null
  ticket_type: { id: string; name: string } | null
  nature: DemandVolumeTicketRefOut | null
  team: DemandVolumeTicketRefOut | null
  parent_ticket: DemandVolumeTicketParentOut | null
}

export interface DemandVolumeTicketsOut {
  items: DemandVolumeTicketItemOut[]
}

export async function getDemandVolumeTickets(
  filters: DemandVolumeFilterIn,
): Promise<DemandVolumeTicketsOut> {
  const response = await api.post<DemandVolumeTicketsOut>(
    '/ticket-dashboard/demand-volume/tickets',
    sanitizeDemandVolumeFilters(filters),
  )
  return response.data
}
