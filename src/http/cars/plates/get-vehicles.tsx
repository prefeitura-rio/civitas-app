'use server'

import { api } from '@/lib/api'
import type { Vehicle } from '@/models/entities'

export async function getVehicles(plates: string[]) {
  const response = await api.post<Vehicle[]>('/cars/plates', {
    plates,
    raise_for_errors: false,
  })

  return response.data.filter((v) => !!v)
}
