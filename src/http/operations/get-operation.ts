'use server'

import { api } from '@/lib/api'
import type { Operation } from '@/models/entities'

interface GetOperationRequest {
  id: string
}

export async function getOperation({ id }: GetOperationRequest) {
  const response = await api.get<Operation>(`/operations/${id}`)
  return response.data
}
