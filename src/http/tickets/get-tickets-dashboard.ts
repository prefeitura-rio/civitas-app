import { api } from '@/lib/api'

export type TicketDashboardFilters = {
  period_days?: number
  overdue_after_days?: number
  search?: string

  ticket_type_id?: string[]
  internal_number?: number[]
  procedure_number?: string[]
  official_letter_number?: string[]
  nature_id?: string[]
  operation_id?: string[]
  requester?: string[]
  assignee_id?: string[]
  focal_point?: string[]

  base_date_start?: string
  base_date_end?: string

  entry_date_start?: string
  entry_date_end?: string

  status?: string[]
  priority?: string[]
  team?: string[]
  /** Valores da API, ex.: plate_search_services */
  services?: string[]
}

export async function getTicketsDashboard(filters: TicketDashboardFilters) {
  const response = await api.post('/tickets/dashboard', {
    period_days: filters.period_days ?? 30,
    overdue_after_days: filters.overdue_after_days ?? 7,
    search: filters.search?.trim() || undefined,

    ticket_type_id: filters.ticket_type_id,
    internal_number: filters.internal_number,
    procedure_number: filters.procedure_number,
    official_letter_number: filters.official_letter_number,
    nature_id: filters.nature_id,
    operation_id: filters.operation_id,
    requester: filters.requester,
    assignee_id: filters.assignee_id,
    focal_point: filters.focal_point,

    base_date_start: filters.base_date_start,
    base_date_end: filters.base_date_end,

    entry_date_start: filters.entry_date_start,
    entry_date_end: filters.entry_date_end,

    status: filters.status,
    priority: filters.priority,
    team: filters.team,
    services: filters.services,
  })

  return response.data
}
