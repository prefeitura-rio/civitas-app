import { api } from '@/lib/api'
import type { Operation } from '@/models/entities'

export function deleteOperation(id: string) {
  return api.delete<Operation>(`/operations/${id}`)
}
