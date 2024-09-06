import { api } from '@/lib/api'
import type { PlateInfo } from '@/models/entities'

export async function getPlateInfo(plate: string) {
  const response = await api.get<PlateInfo>(`/cars/plate/${plate}`)
  return response.data
}
