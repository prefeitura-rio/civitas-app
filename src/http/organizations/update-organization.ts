import { api } from '@/lib/api'
import type { BackendOrganization } from '@/models/entities'

import { mapOrganization } from './map-organization'

export interface UpdateOrganizationRequest {
  id: string
  name?: string
  organizationType?: string
  acronym?: string
  jurisdictionLevel?: string
}

export async function updateOrganization({
  id,
  name,
  organizationType,
  acronym,
  jurisdictionLevel,
}: UpdateOrganizationRequest) {
  const body: Record<string, string | undefined> = {}
  if (typeof name !== 'undefined') body.name = name
  if (typeof organizationType !== 'undefined')
    body.organization_type = organizationType
  if (typeof acronym !== 'undefined') body.acronym = acronym
  if (typeof jurisdictionLevel !== 'undefined')
    body.jurisdiction_level = jurisdictionLevel

  const response = await api.put<BackendOrganization>(
    `/organizations/${id}`,
    body,
  )

  return {
    ...response,
    data: mapOrganization(response.data),
  }
}
