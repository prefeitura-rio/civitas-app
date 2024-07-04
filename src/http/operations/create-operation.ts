import { api } from '@/lib/api'
import type { Operation } from '@/models/entities'

interface CreateOperationRequest {
  title: string
  description: string
}

export function createOperation({
  title,
  description,
}: CreateOperationRequest) {
  const response = api.post<Operation>('/operations', {
    title,
    description,
  })
  return response
}
