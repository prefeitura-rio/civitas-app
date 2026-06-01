import { api } from '@/lib/api'

export interface TicketListItem {
  id: string
  created_at: string // datetime ISO
  ticket_type_id: string
  operation_id: string | null
  priority: 'URGENTE' | 'ALTA' | 'ROTINA'
  nature_name:
    | 'CIVIL'
    | 'CRIMINAL'
    | 'TRABALHISTA'
    | 'ADMINISTRATIVO'
    | 'OUTROS'
    | null
  procedure_number: string | null
  official_letter_number: string | null
  requester_name: string
  comments_count: number
  last_comment_at: string | null
}

export interface TicketsPageOut {
  items: TicketListItem[]
  page: number
  size: number
  total: number
}

export interface GetTicketsRequest {
  page?: number
  size?: number
}

export async function getTickets({ page = 1, size = 20 }: GetTicketsRequest) {
  return api.get<TicketsPageOut>('/tickets', { params: { page, size } })
}
