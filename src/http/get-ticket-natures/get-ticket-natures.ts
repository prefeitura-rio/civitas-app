import { api } from '@/lib/api'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

export interface TicketNature {
  id: string
  name: string
  isActive?: boolean
}

interface GetTicketNaturesRequest extends PaginationRequest {
  search?: string
  isActive?: boolean
}

export interface GetTicketNaturesResponse extends PaginationResponse {
  items: TicketNature[]
}

export function getTicketNatures({
  search,
  isActive,
}: GetTicketNaturesRequest) {
  return api.get<TicketNature[]>('/ticket-natures', {
    params: {
      search,
      isActive,
    },
  })
}
