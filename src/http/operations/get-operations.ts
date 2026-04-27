import { api } from '@/lib/api'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

export interface Operation {
  id: string
  title: string
}

export interface GetOperationsResponse extends PaginationResponse {
  items: Operation[]
}

export function getOperations({ page, size }: PaginationRequest) {
  return api.get<GetOperationsResponse>('/operations', {
    params: { page, size },
  })
}
