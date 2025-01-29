'use server'

import { api } from '@/lib/api'

export async function getReportsSubtypes() {
  const response = await api.get<string[]>('/reports/subtypes')
  return response.data
}
