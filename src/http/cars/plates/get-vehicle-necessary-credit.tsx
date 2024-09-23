import { api } from '@/lib/api'

interface getVehiclesNecessaryCreditResponse {
  credits: number
}
export async function getVehiclesNecessaryCredit(plates: string[]) {
  const response = await api.post<getVehiclesNecessaryCreditResponse>(
    '/cars/plates/credit',
    {
      plates,
    },
  )
  return response.data
}
