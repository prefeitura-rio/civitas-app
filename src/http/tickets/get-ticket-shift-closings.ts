import { api } from '@/lib/api'

export type TicketShiftClosingFilters = {
  closed_by_id?: string
  team_id?: string
  shift_date?: string
  page?: number
  page_size?: number
}

export type TicketShiftClosingListItem = {
  id: string
  shift_date: string
  closed_at: string
  adjunct: string
  team: string
  ticket_count: number
}

export type TicketShiftClosingListOut = {
  items: TicketShiftClosingListItem[]
  total: number
  page: number
  page_size: number
  pages: number
}

export async function getTicketShiftClosings(
  filters: TicketShiftClosingFilters,
) {
  const { data } = await api.get<TicketShiftClosingListOut>(
    '/tickets/shift-closings',
    {
      params: {
        closed_by_id: filters.closed_by_id || undefined,
        team_id: filters.team_id || undefined,
        shift_date: filters.shift_date || undefined,
        page: filters.page ?? 1,
        page_size: filters.page_size ?? 20,
      },
    },
  )

  return data
}
