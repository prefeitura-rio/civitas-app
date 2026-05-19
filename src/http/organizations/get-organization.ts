import { api } from '@/lib/api'
import type { BackendOrganization, Organization } from '@/models/entities'

import { mapOrganization } from './map-organization'

interface GetOrganizationRequest {
  id: string
}

export async function getOrganization({
  id,
}: GetOrganizationRequest): Promise<Organization> {
  const response = await api.get<BackendOrganization>(`/organizations/${id}`)
  return mapOrganization(response.data)
}
