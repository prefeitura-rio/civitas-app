import { api } from '@/lib/api'
import type {
  BackendRequestingInstitution,
  RequestingInstitution,
} from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'
import { toCleanQueryString } from '@/utils/to-query-params'

export interface GetRequestingInstitutionsResponse extends PaginationResponse {
  items: RequestingInstitution[]
}

interface BackendGetRequestingInstitutionsResponse {
  items: BackendRequestingInstitution[]
  pagination: PaginationResponse
}

export type { RequestingInstitution } from '@/models/entities'

export type RequestingInstitutionSortBy =
  | 'name'
  | 'type'
  | 'agency'
  | 'jurisdiction_level'
  | 'created_at'

export type SortDirection = 'asc' | 'desc'

interface GetRequestingInstitutionRequest {
  id: string
}

export interface CreateRequestingInstitutionRequest
  extends Pick<
    RequestingInstitution,
    'name' | 'type' | 'agency' | 'jurisdictionLevel'
  > {}

export interface UpdateRequestingInstitutionRequest
  extends Partial<
    Pick<
      RequestingInstitution,
      'name' | 'type' | 'agency' | 'jurisdictionLevel'
    >
  > {
  id: string
}

function mapBackendRequestingInstitution(
  item: BackendRequestingInstitution,
): RequestingInstitution {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    agency: item.agency,
    jurisdictionLevel: item.jurisdiction_level,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export interface GetRequestingInstitutionsRequest extends PaginationRequest {
  search?: string
  type?: string
  agency?: string
  jurisdictionLevel?: RequestingInstitution['jurisdictionLevel']
  sortBy?: RequestingInstitutionSortBy
  sortDirection?: SortDirection
}

export async function getRequestingInstitutions({
  page,
  size,
  search,
  type,
  agency,
  jurisdictionLevel,
  sortBy,
  sortDirection,
}: GetRequestingInstitutionsRequest) {
  const queryString = toCleanQueryString({
    page,
    size,
    search,
    type,
    agency,
    jurisdiction_level: jurisdictionLevel,
    ...(sortBy && sortDirection
      ? { sort_by: sortBy, sort_direction: sortDirection }
      : {}),
  })
  const response = await api.get<BackendGetRequestingInstitutionsResponse>(
    `/requesting-institutions${queryString ? `?${queryString}` : ''}`,
  )

  return {
    ...response,
    data: {
      ...response.data.pagination,
      items: response.data.items.map(mapBackendRequestingInstitution),
    } satisfies GetRequestingInstitutionsResponse,
  }
}

export async function getRequestingInstitution({
  id,
}: GetRequestingInstitutionRequest) {
  const response = await api.get<BackendRequestingInstitution>(
    `/requesting-institutions/${id}`,
  )

  return mapBackendRequestingInstitution(response.data)
}

export async function createRequestingInstitution({
  name,
  type,
  agency,
  jurisdictionLevel,
}: CreateRequestingInstitutionRequest) {
  const response = await api.post<BackendRequestingInstitution>(
    '/requesting-institutions',
    {
      name,
      type,
      agency,
      jurisdiction_level: jurisdictionLevel,
    },
  )

  return mapBackendRequestingInstitution(response.data)
}

export async function updateRequestingInstitution({
  id,
  name,
  type,
  agency,
  jurisdictionLevel,
}: UpdateRequestingInstitutionRequest) {
  const response = await api.patch<BackendRequestingInstitution>(
    `/requesting-institutions/${id}`,
    {
      name,
      type,
      agency,
      jurisdiction_level: jurisdictionLevel,
    },
  )

  return mapBackendRequestingInstitution(response.data)
}

export function deleteRequestingInstitution(id: string) {
  return api.delete(`/requesting-institutions/${id}`)
}
