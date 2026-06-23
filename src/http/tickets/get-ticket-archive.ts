import { api } from '@/lib/api'

import type { TicketDashboardServiceFilter } from './tickets-dashboard-filters'

export type TicketArchiveServiceFilter = TicketDashboardServiceFilter

export type TicketArchiveFilters = {
  search?: string
  page?: number
  page_size?: number
  operation_id?: string[]
  requester?: string[]
  assignee_id?: string[]
  base_date_start?: string
  base_date_end?: string
  entry_date_start?: string
  entry_date_end?: string
  priority?: string[]
  team?: string[]
  services?: TicketArchiveServiceFilter[]
}

export type TicketArchiveListItem = {
  id: string
  ticket: string
  completed_at?: string | null
  requester_operation: string
  team: string
  assignee: string
  services: string[]
  status: string
  sei_filled?: boolean
}

export type TicketArchivePageOut = {
  items: TicketArchiveListItem[]
  total: number
  page: number
  page_size: number
  pages: number
}

export async function getTicketArchive(filters: TicketArchiveFilters) {
  const response = await api.post<TicketArchivePageOut>('/tickets/archive', {
    search: filters.search?.trim() || undefined,
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 20,
    operation_id: filters.operation_id,
    requester: filters.requester,
    assignee_id: filters.assignee_id,
    base_date_start: filters.base_date_start || undefined,
    base_date_end: filters.base_date_end || undefined,
    entry_date_start: filters.entry_date_start || undefined,
    entry_date_end: filters.entry_date_end || undefined,
    priority: filters.priority,
    team: filters.team,
    services: filters.services,
  })

  return response.data
}
