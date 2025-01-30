import { api } from '@/lib/api'
import type { Operation } from '@/models/entities'

interface GetOperationRequest {
  id: string
}

export function getOperation({ id }: GetOperationRequest) {
  return api.get<Operation>(`/operations/${id}`)
}
