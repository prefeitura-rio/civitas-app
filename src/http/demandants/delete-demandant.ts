import { api } from '@/lib/api'
import type { BackendDemandant } from '@/models/entities'

import { mapDemandant } from './map-demandant'

export async function deleteDemandant(id: string) {
  const response = await api.delete<BackendDemandant>(`/demandants/${id}`)

  return {
    ...response,
    data: mapDemandant(response.data),
  }
}
