import { api } from '@/lib/api'
import type { BackendDemandant, Demandant } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

import { mapDemandant } from './map-demandant'

interface GetDemandantsRequest extends PaginationRequest {
  organizationId?: string
}

interface BackendGetDemandantsResponse extends PaginationResponse {
  items: BackendDemandant[]
}

export interface GetDemandantsResponse extends PaginationResponse {
  items: Demandant[]
}

export async function getDemandants({
  page,
  size,
  organizationId,
}: GetDemandantsRequest) {
  const response = await api.get<BackendGetDemandantsResponse>('/demandants', {
    params: {
      page,
      size,
      organization_id: organizationId,
    },
  })

  return {
    ...response,
    data: {
      ...response.data,
      items: response.data.items.map(mapDemandant),
    },
  }
}
