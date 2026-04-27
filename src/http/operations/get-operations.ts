import { api } from '@/lib/api'
import type { Operation } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

export type { Operation } from '@/models/entities'

export interface GetOperationsResponse extends PaginationResponse {
  items: Operation[]
}

export function getOperations({ page, size }: PaginationRequest) {
  return api.get<GetOperationsResponse>('/operations', {
    params: { page, size },
  })
}
