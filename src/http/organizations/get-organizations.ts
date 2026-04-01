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

/** QueryKey compartilhada: lista completa (paginada no cliente) para filtros. */
export const ORGANIZATIONS_DEMANDANTS_FILTER_QUERY_KEY = [
  'organizations',
  'demandants-filter',
] as const

const FILTER_PAGE_SIZE = 50

/**
 * Várias páginas com `size` moderado — alguns backends rejeitam `size` muito grande (ex.: 200).
 */
export async function getOrganizationsForDemandantsFilter(): Promise<
  Organization[]
> {
  let page = 1
  const merged: Organization[] = []
  let totalPages = 1

  for (;;) {
    const response = await api.get<BackendGetOrganizationsResponse>(
      '/organizations',
      {
        params: { page, size: FILTER_PAGE_SIZE },
      },
    )
    const backend = response.data
    if (!backend) break

    const rawItems = backend.items
    const batch = Array.isArray(rawItems) ? rawItems.map(mapOrganization) : []
    merged.push(...batch)

    totalPages =
      typeof backend.pages === 'number' && backend.pages >= 1
        ? backend.pages
        : 1

    if (page >= totalPages || batch.length === 0) break
    page += 1
    if (page > 500) break
  }

  return merged
}

export async function getOrganizations({ page, size }: PaginationRequest) {
  const response = await api.get<BackendGetOrganizationsResponse>(
    '/organizations',
    {
      params: { page, size },
    },
  )

  const backend =
    response.data ?? ({} as Partial<BackendGetOrganizationsResponse>)
  const rawItems = backend.items
  const items = Array.isArray(rawItems) ? rawItems.map(mapOrganization) : []

  return {
    ...response,
    data: {
      ...backend,
      items,
    } as GetOrganizationsResponse,
  }
}
