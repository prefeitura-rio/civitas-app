import { api } from '@/lib/api'

export async function getReportsCategories() {
  const response = await api.get<string[]>('/reports/categories')
  return response.data
}
