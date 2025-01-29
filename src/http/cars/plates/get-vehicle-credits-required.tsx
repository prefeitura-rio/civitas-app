'use server'

import { api } from '@/lib/api'

interface getVehiclesCreditsRequiredResponse {
  credits: number
}
export async function getVehiclesCreditsRequired(plates: string[]) {
  const response = await api.post<getVehiclesCreditsRequiredResponse>(
    '/cars/plates/credit',
    {
      plates,
    },
  )
  return response.data
}
