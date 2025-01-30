import { api } from '@/lib/api'
import type { Operation } from '@/models/entities'

export function updateOperation({ id, title, description }: Operation) {
  return api.put<Operation>(`/operations/${id}`, {
    title,
    description,
  })
}
