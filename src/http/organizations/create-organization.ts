import { api } from '@/lib/api'
import type { BackendOrganization } from '@/models/entities'

import { mapOrganization } from './map-organization'

export interface CreateOrganizationRequest {
  name: string
  organizationType: string
  acronym: string
  jurisdictionLevel: string
}

export async function createOrganization({
  name,
  organizationType,
  acronym,
  jurisdictionLevel,
}: CreateOrganizationRequest) {
  const response = await api.post<BackendOrganization>('/organizations', {
    name,
    organization_type: organizationType,
    acronym,
    jurisdiction_level: jurisdictionLevel,
  })

  return {
    ...response,
    data: mapOrganization(response.data),
  }
}
