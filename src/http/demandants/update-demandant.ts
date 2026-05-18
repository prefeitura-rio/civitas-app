import { api } from '@/lib/api'
import type { BackendDemandant } from '@/models/entities'

import { mapDemandant } from './map-demandant'

export interface UpdateDemandantRequest {
  id: string
  organizationId?: string
  name?: string
  email?: string
  phone1?: string
  phone2?: string | null
  phone3?: string | null
}

export async function updateDemandant({
  id,
  organizationId,
  name,
  email,
  phone1,
  phone2,
  phone3,
}: UpdateDemandantRequest) {
  const body: Record<string, unknown> = {}
  if (typeof organizationId !== 'undefined')
    body.organization_id = organizationId
  if (typeof name !== 'undefined') body.name = name
  if (typeof email !== 'undefined') body.email = email
  if (typeof phone1 !== 'undefined') body.phone_1 = phone1
  if (typeof phone2 !== 'undefined') body.phone_2 = phone2
  if (typeof phone3 !== 'undefined') body.phone_3 = phone3

  const response = await api.put<BackendDemandant>(`/demandants/${id}`, body)

  return {
    ...response,
    data: mapDemandant(response.data),
  }
}
