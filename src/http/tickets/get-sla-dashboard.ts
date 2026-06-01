import type { TicketStatus } from '@/app/(app)/demandas/dashboard-tatico/utils/ticket-status'
import { api } from '@/lib/api'

import type {
  DemandVolumeTicketItemOut,
  DemandVolumeTicketsOut,
} from './get-demand-volume'

export type SlaDashboardGranularity = 'monthly' | 'weekly' | 'yearly'

export type TicketPriority = 'URGENTE' | 'ALTA' | 'ROTINA'

export type SlaTicketStatus = TicketStatus

export interface SlaDashboardFilterIn {
  date_from?: string
  date_to?: string
  /** Herdado do volume; ignorado no SLA. */
  summary_period?: 'current_week' | 'current_month' | 'current_year'
  operation_id?: string[]
  requester?: string[]
  priority?: TicketPriority[]
  status?: SlaTicketStatus[]
  ticket_type_id?: string[]
  media_relevant?: boolean | null
}

export interface SlaDashboardSummaryOut {
  total_demands: number
  avg_resolution_days: number
  overall_sla_attained_percent: number
  resolution_rate_percent: number
}

export interface AvgResolutionTimeGeneralItemOut {
  period_label: string
  from_registration_days: number | null
  from_email_days: number | null
}

export interface AvgResolutionTimeByPriorityItemOut {
  period_label: string
  urgent_days: number | null
  high_days: number | null
  routine_days: number | null
  no_priority_days: number | null
}

export interface DeliveryTimeMediaItemOut {
  period_label: string
  avg_days: number | null
}

export interface SlaPerformancePeriodOut {
  period_label: string
  sla_percent: number
  is_above_average: boolean
}

export interface SlaPerformanceRowOut {
  label: string
  periods: SlaPerformancePeriodOut[]
}

export interface SlaDashboardGranularitySeries<T> {
  monthly: T[]
  weekly: T[]
  yearly: T[]
}

export interface SlaDashboardOut {
  summary: SlaDashboardSummaryOut
  avg_resolution_time_general: SlaDashboardGranularitySeries<AvgResolutionTimeGeneralItemOut>
  avg_resolution_time_by_priority: SlaDashboardGranularitySeries<AvgResolutionTimeByPriorityItemOut>
  sla_performance_by_priority: SlaPerformanceRowOut[]
  sla_performance_by_service: SlaPerformanceRowOut[]
  delivery_time_for_media_relevant: SlaDashboardGranularitySeries<DeliveryTimeMediaItemOut>
}

export function pickSlaDashboardGranularitySeries<T>(
  series: SlaDashboardGranularitySeries<T> | undefined,
  granularity: SlaDashboardGranularity,
): T[] {
  if (!series) return []
  return series[granularity] ?? []
}

export function sanitizeSlaDashboardFilters(
  filters: SlaDashboardFilterIn,
): SlaDashboardFilterIn {
  const payload: SlaDashboardFilterIn = { ...filters }

  delete payload.summary_period
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

export async function getSlaDashboard(
  filters: SlaDashboardFilterIn,
): Promise<SlaDashboardOut> {
  const response = await api.post(
    '/ticket-dashboard/sla',
    sanitizeSlaDashboardFilters(filters),
  )
  return response.data
}

/** Mesmos campos do export de volume de demandas (DemandVolumeTicketExportItemOut). */
export type SlaTicketExportItemOut = DemandVolumeTicketItemOut

export type SlaTicketExportOut = DemandVolumeTicketsOut

export async function getSlaDashboardTickets(
  filters: SlaDashboardFilterIn,
): Promise<SlaTicketExportOut> {
  const response = await api.post<SlaTicketExportOut>(
    '/ticket-dashboard/sla/tickets',
    sanitizeSlaDashboardFilters(filters),
  )
  return response.data
}
