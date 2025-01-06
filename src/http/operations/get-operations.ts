'use server'

import { api } from '@/lib/api'
import type { Operation } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

interface GetOperationsRequest extends PaginationRequest {}

export interface GetOperationsResponse extends PaginationResponse {
  items: Operation[]
}

export async function getOperations({ page, size }: GetOperationsRequest) {
  const response = await api.get<GetOperationsResponse>('/operations', {
    params: {
      page,
      size,
    },
  })

  return response.data
}
