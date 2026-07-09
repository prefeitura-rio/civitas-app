import { api } from '@/lib/api'
import type {
  BackendRequestingInstitution,
  RequestingInstitution,
} from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

export interface GetRequestingInstitutionsResponse extends PaginationResponse {
  items: RequestingInstitution[]
}

interface BackendGetRequestingInstitutionsResponse {
  items: BackendRequestingInstitution[]
  pagination: PaginationResponse
}

export type { RequestingInstitution } from '@/models/entities'

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

export async function getRequestingInstitutions({
  page,
  size,
}: PaginationRequest) {
  const response = await api.get<BackendGetRequestingInstitutionsResponse>(
    '/requesting-institutions/',
    {
      params: { page, size },
    },
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
    '/requesting-institutions/',
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
