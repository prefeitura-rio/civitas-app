import { api } from '@/lib/api'
import type { PaginationRequest } from '@/models/pagination'

export interface TicketType {
  id: string
  name: string
  isActive?: boolean
}

interface GetTicketTypesRequest extends PaginationRequest {
  search?: string
  isActive?: boolean
}

export function getTicketTypes({ search, isActive }: GetTicketTypesRequest) {
  return api.get<TicketType[]>('/ticket-types', {
    params: {
      search,
      isActive,
    },
  })
}
