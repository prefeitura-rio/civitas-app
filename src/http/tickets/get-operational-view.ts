import type { TicketStatus } from '@/app/(app)/demandas/dashboard-tatico/utils/ticket-status'
import { api } from '@/lib/api'

import type {
  DemandVolumeTicketItemOut,
  DemandVolumeTicketsOut,
} from './get-demand-volume'

export type OperationalViewGranularity = 'monthly' | 'weekly' | 'yearly'

export type OperationalViewSummaryPeriod =
  | 'current_year'
  | 'current_month'
  | 'current_week'

export type OperationalViewPriority = 'URGENTE' | 'ALTA' | 'ROTINA'

export type OperationalViewStatus = TicketStatus

export interface OperationalViewFilterIn {
  date_from?: string
  date_to?: string
  summary_period?: OperationalViewSummaryPeriod
  operation_id?: string[]
  requester?: string[]
  priority?: OperationalViewPriority[]
  status?: OperationalViewStatus[]
  ticket_type_id?: string[]
  media_relevant?: boolean | null
}

export interface OperationalViewSummaryOut {
  total_pending: number
  total_blocked: number
  total_awaiting_review: number
  total_completed: number
}

export interface OpenTicketsByTeamItemOut {
  team: string
  pendente: number
  bloqueado: number
  aguardando_revisao?: number
  aguardando_revisao_adjunto?: number
  aguardando_revisao_administrativo?: number
}

export interface TeamPeriodValueOut {
  period_label: string
  value: number
}

export interface TeamPeriodSeriesOut {
  team: string
  data: TeamPeriodValueOut[]
}

export interface OperationalViewGranularitySeries<T> {
  monthly: T[]
  weekly: T[]
  yearly: T[]
}

export interface SlaPerformancePeriodOut {
  period_label: string
  sla_percent: number
  is_above_average: boolean
}

export interface SlaPerformanceByTeamRowOut {
  label: string
  periods: SlaPerformancePeriodOut[]
}

export interface OperationalViewOut {
  summary: OperationalViewSummaryOut
  open_tickets_by_team: OpenTicketsByTeamItemOut[]
  closed_volume_by_team: OperationalViewGranularitySeries<TeamPeriodSeriesOut>
  avg_resolution_time_by_team: OperationalViewGranularitySeries<TeamPeriodSeriesOut>
  sla_performance_by_team: SlaPerformanceByTeamRowOut[]
}

export function pickOperationalViewGranularitySeries<T>(
  series: OperationalViewGranularitySeries<T> | undefined,
  granularity: OperationalViewGranularity,
): T[] {
  if (!series) return []
  return series[granularity] ?? []
}

export function sanitizeOperationalViewFilters(
  filters: OperationalViewFilterIn,
): OperationalViewFilterIn {
  const payload: OperationalViewFilterIn = { ...filters }

  if (!payload.operation_id?.length) delete payload.operation_id
  if (!payload.requester?.length) delete payload.requester
  if (!payload.priority?.length) delete payload.priority
  if (!payload.status?.length) delete payload.status
  if (!payload.ticket_type_id?.length) delete payload.ticket_type_id
  if (payload.media_relevant === undefined) {
    delete payload.media_relevant
  }

  return payload
}

export async function getOperationalView(
  filters: OperationalViewFilterIn,
): Promise<OperationalViewOut> {
  const response = await api.post(
    '/ticket-dashboard/operational-view',
    sanitizeOperationalViewFilters(filters),
  )
  return response.data
}

/** Mesmos campos do export de volume de demandas (DemandVolumeTicketExportItemOut). */
export type OperationalViewTicketItemOut = DemandVolumeTicketItemOut

export type OperationalViewTicketsOut = DemandVolumeTicketsOut

export async function getOperationalViewTickets(
  filters: OperationalViewFilterIn,
): Promise<OperationalViewTicketsOut> {
  const response = await api.post<OperationalViewTicketsOut>(
    '/ticket-dashboard/operational-view/tickets',
    sanitizeOperationalViewFilters(filters),
  )
  return response.data
}
