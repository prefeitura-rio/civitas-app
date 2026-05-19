import { api } from '@/lib/api'
import type { BackendDemandant, Demandant } from '@/models/entities'

import { mapDemandant } from './map-demandant'

interface GetDemandantRequest {
  id: string
}

export async function getDemandant({
  id,
}: GetDemandantRequest): Promise<Demandant> {
  const response = await api.get<BackendDemandant>(`/demandants/${id}`)
  return mapDemandant(response.data)
}
