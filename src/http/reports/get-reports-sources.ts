'use server'

import { api } from '@/lib/api'

export async function getReportsSources() {
  const response = await api.get<string[]>('/reports/sources')
  return response.data
}
