import { api } from '@/lib/api'
import type { BackendOrganization, Organization } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

import { mapOrganization } from './map-organization'

interface BackendGetOrganizationsResponse extends PaginationResponse {
  items: BackendOrganization[]
}

export interface GetOrganizationsResponse extends PaginationResponse {
  items: Organization[]
}

export async function getOrganizations({ page, size }: PaginationRequest) {
  const response = await api.get<BackendGetOrganizationsResponse>(
    '/organizations',
    {
      params: { page, size },
    },
  )

  return {
    ...response,
    data: {
      ...response.data,
      items: response.data.items.map(mapOrganization),
    },
  }
}
