import { api } from '@/lib/api'
import type { Operation } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

interface getOperationsRequest extends PaginationRequest {}

export interface GetOperationsResponse extends PaginationResponse {
  items: Operation[]
}

export function getOperations({ page, size }: getOperationsRequest) {
  return api.get<GetOperationsResponse>('/operations', {
    params: {
      page,
      size,
    },
  })
}
