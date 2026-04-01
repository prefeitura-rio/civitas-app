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
  const searchParams = new URLSearchParams()
  if (typeof page === 'number') searchParams.set('page', String(page))
  if (typeof size === 'number') searchParams.set('size', String(size))
  if (organizationId) searchParams.set('organization_id', organizationId)

  const qs = searchParams.toString()
  const response = await api.get<BackendGetDemandantsResponse>(
    qs ? `/demandants?${qs}` : '/demandants',
  )

  return {
    ...response,
    data: {
      ...response.data,
      items: response.data.items.map(mapDemandant),
    },
  }
}
