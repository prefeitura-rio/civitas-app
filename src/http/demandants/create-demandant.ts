import { api } from '@/lib/api'
import type { BackendDemandant } from '@/models/entities'

import { mapDemandant } from './map-demandant'

export interface CreateDemandantRequest {
  organizationId: string
  name?: string
  email?: string
  phone1?: string
  phone2?: string | null
  phone3?: string | null
}

export async function createDemandant({
  organizationId,
  name,
  email,
  phone1,
  phone2,
  phone3,
}: CreateDemandantRequest) {
  const response = await api.post<BackendDemandant>('/demandants', {
    organization_id: organizationId,
    name: name || undefined,
    email: email || undefined,
    phone_1: phone1 || undefined,
    phone_2: phone2 ?? null,
    phone_3: phone3 ?? null,
  })

  return {
    ...response,
    data: mapDemandant(response.data),
  }
}
