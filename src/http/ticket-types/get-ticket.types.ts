import { api } from '@/lib/api'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

export interface TicketType {
  id: string
  name: string
  isActive?: boolean
}

interface GetTicketTypesRequest extends PaginationRequest {
  search?: string
  isActive?: boolean
}

export interface GetTicketTypesResponse extends PaginationResponse {
  items: TicketType[]
}

export function getTicketTypes({ search, isActive }: GetTicketTypesRequest) {
  return api.get<TicketType[]>('/ticket-types', {
    params: {
      search,
      isActive,
    },
  })
}
