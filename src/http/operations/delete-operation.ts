'use server'

import { api } from '@/lib/api'
import type { Operation } from '@/models/entities'

export async function deleteOperation(id: string) {
  const response = await api.delete<Operation>(`/operations/${id}`)
  return response.data
}
