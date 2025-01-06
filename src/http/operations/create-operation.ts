'use server'

import { api } from '@/lib/api'
import type { Operation } from '@/models/entities'

interface CreateOperationRequest {
  title: string
  description: string
}

export async function createOperation({
  title,
  description,
}: CreateOperationRequest) {
  const response = await api.post<Operation>('/operations', {
    title,
    description,
  })
  return response.data
}
