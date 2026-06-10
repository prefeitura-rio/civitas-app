import { api } from '@/lib/api'
import type { Operation } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

export interface SearchOperationsResponse extends PaginationResponse {
  items: Operation[]
}

export type SearchOperationsParams = PaginationRequest & {
  search?: string
}

export async function searchOperationsPaginated({
  search = '',
  page = 1,
  size = 20,
}: SearchOperationsParams) {
  const response = await api.get<SearchOperationsResponse>('/operations', {
    params: { search, page, size },
  })

  return response.data
}
