'use server'

import { api } from '@/lib/api'
import type { Operation } from '@/models/entities'

export async function updateOperation({ id, title, description }: Operation) {
  const response = await api.put<Operation>(`/operations/${id}`, {
    title,
    description,
  })
  return response.data
}
