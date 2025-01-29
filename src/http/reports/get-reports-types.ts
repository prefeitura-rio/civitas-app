'use server'

import { api } from '@/lib/api'

export async function getReportsTypes() {
  const response = await api.get<string[]>('/reports/types')
  return response.data
}
