'use server'

import { api } from '@/lib/api'
import type { FogoCruzadoIncident } from '@/models/entities'

export async function getFogoCruzadoIncidents() {
  const response = await api.get<FogoCruzadoIncident[]>('layers/fogocruzado')
  return response.data
}
