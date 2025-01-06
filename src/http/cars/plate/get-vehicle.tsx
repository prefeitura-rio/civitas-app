'use server'

import { api } from '@/lib/api'
import type { Vehicle } from '@/models/entities'

export async function getVehicle(plate: string) {
  const response = await api.get<Vehicle>(`/cars/plate/${plate}`)

  return response.data
}
