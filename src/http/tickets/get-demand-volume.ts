import type { TicketStatus } from '@/app/(app)/demandas/dashboard-tatico/utils/ticket-status'
import { api } from '@/lib/api'

export type DemandVolumeGranularity = 'monthly' | 'weekly' | 'yearly'

export type DemandVolumeSummaryPeriod =
  | 'current_year'
  | 'current_month'
  | 'current_week'

export type TicketPriority = 'URGENTE' | 'ALTA' | 'ROTINA'

export type { TicketStatus } from '@/app/(app)/demandas/dashboard-tatico/utils/ticket-status'

export interface DemandVolumeFilterIn {
  date_from?: string
  date_to?: string
  /** Afeta apenas summary (Total, Encerradas, Em aberto, Bloqueadas). Padrão: current_year */
  summary_period?: DemandVolumeSummaryPeriod
  operation_id?: string[]
  requester?: string[]
  priority?: TicketPriority[]
  status?: TicketStatus[]
  ticket_type_id?: string[]
  media_relevant?: boolean | null
  /** Página da matriz closed_calls_by_requester (1-based). Padrão: 1 */
  closed_calls_by_requester_page?: number
}

export interface DemandVolumeSummaryOut {
  total: number
  closed: number
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
  no_priority: number
}

export interface MatrixRowOut {
  label: string
  periods: PeriodValueItemOut[]
  total: number
}

export interface PaginatedMatrixRowsOut {
  items: MatrixRowOut[]
  total: number
  page: number
  page_size: number
  pages: number
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
  closed_calls_by_requester: PaginatedMatrixRowsOut
}

export function sanitizeDemandVolumeFilters(
  filters: DemandVolumeFilterIn,
): DemandVolumeFilterIn {
  const payload: DemandVolumeFilterIn = { ...filters }

  if (!payload.operation_id?.length) delete payload.operation_id
  if (!payload.requester?.length) delete payload.requester
  if (!payload.priority?.length) delete payload.priority
  if (!payload.status?.length) delete payload.status
  if (!payload.ticket_type_id?.length) delete payload.ticket_type_id
  if (payload.media_relevant === undefined) {
    delete payload.media_relevant
  }
  if (
    !payload.closed_calls_by_requester_page ||
    payload.closed_calls_by_requester_page <= 1
  ) {
    delete payload.closed_calls_by_requester_page
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
