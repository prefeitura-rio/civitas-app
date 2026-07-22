import { api } from '@/lib/api'
import type {
  BackendInstitutionAuthority,
  BackendInstitutionAuthorityContacts,
  BackendInstitutionAuthorityEmail,
  BackendInstitutionAuthorityPhone,
  BackendInstitutionAuthorityPrimaryContact,
  BackendRequestingInstitution,
  InstitutionAuthority,
  InstitutionAuthorityContacts,
  InstitutionAuthorityEmail,
  InstitutionAuthorityPhone,
  InstitutionAuthorityPrimaryContact,
  RequestingInstitution,
} from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'
import { toCleanQueryString } from '@/utils/to-query-params'

export interface GetInstitutionAuthoritiesResponse extends PaginationResponse {
  items: InstitutionAuthority[]
}

export interface BackendGetInstitutionAuthoritiesResponse {
  items: BackendInstitutionAuthority[]
  pagination: PaginationResponse
}

export type { InstitutionAuthority } from '@/models/entities'

export type InstitutionAuthoritySortBy =
  | 'name'
  | 'requesting_institution_name'
  | 'created_at'

export type SortDirection = 'asc' | 'desc'

export interface GetInstitutionAuthoritiesRequest extends PaginationRequest {
  search?: string
  requestingInstitutionId?: string
  isFocalPoint?: boolean
  jurisdictionLevel?: RequestingInstitution['jurisdictionLevel']
  sortBy?: InstitutionAuthoritySortBy
  sortDirection?: SortDirection
}

interface GetInstitutionAuthorityRequest {
  id: string
}

export interface CreateInstitutionAuthorityRequest
  extends Pick<
    InstitutionAuthority,
    'name' | 'requestingInstitutionId' | 'isFocalPoint'
  > {}

export interface UpdateInstitutionAuthorityRequest
  extends Partial<
    Pick<
      InstitutionAuthority,
      'name' | 'requestingInstitutionId' | 'isFocalPoint'
    >
  > {
  id: string
}

export interface ReplaceInstitutionAuthorityContactsRequest
  extends InstitutionAuthorityContacts {
  id: string
}

function mapBackendRequestingInstitution(
  item?: BackendRequestingInstitution,
): RequestingInstitution | undefined {
  if (!item) return undefined

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

function mapBackendPhone(
  item: BackendInstitutionAuthorityPhone,
): InstitutionAuthorityPhone {
  return {
    id: item.id,
    phone: item.phone,
    isPrimary: item.is_primary,
  }
}

function mapBackendEmail(
  item: BackendInstitutionAuthorityEmail,
): InstitutionAuthorityEmail {
  return {
    id: item.id,
    email: item.email,
    isPrimary: item.is_primary,
  }
}

function mapBackendInstitutionAuthorityContacts(
  contacts?: BackendInstitutionAuthorityContacts | null,
): InstitutionAuthorityContacts | null {
  if (!contacts) return null

  return {
    phones: (contacts.phones ?? []).map(mapBackendPhone),
    emails: (contacts.emails ?? []).map(mapBackendEmail),
  }
}

function mapBackendPrimaryContact(
  contact?: BackendInstitutionAuthorityPrimaryContact,
): InstitutionAuthorityPrimaryContact {
  if (!contact) return null

  return {
    phone: contact.phone ? mapBackendPhone(contact.phone) : undefined,
    email: contact.email ? mapBackendEmail(contact.email) : undefined,
  }
}

function derivePrimaryContactFromContacts(
  contacts: InstitutionAuthorityContacts | null,
): InstitutionAuthorityPrimaryContact {
  if (!contacts) return null

  return {
    phone:
      contacts.phones.find((item) => item.isPrimary) ?? contacts.phones.at(0),
    email:
      contacts.emails.find((item) => item.isPrimary) ?? contacts.emails.at(0),
  }
}

function mapBackendInstitutionAuthority(
  item: BackendInstitutionAuthority,
): InstitutionAuthority {
  const requestingInstitution = mapBackendRequestingInstitution(
    item.requesting_institution,
  )
  const contacts = mapBackendInstitutionAuthorityContacts(item.contact)
  const primaryContact =
    mapBackendPrimaryContact(item.primary_contact) ??
    derivePrimaryContactFromContacts(contacts)

  return {
    id: item.id,
    name: item.name,
    requestingInstitutionId:
      item.requesting_institution_id ?? requestingInstitution?.id ?? '',
    requestingInstitution,
    primaryContact,
    isFocalPoint: item.is_focal_point,
    contacts,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export async function getInstitutionAuthorities({
  page,
  size,
  search,
  requestingInstitutionId,
  isFocalPoint,
  jurisdictionLevel,
  sortBy,
  sortDirection,
}: GetInstitutionAuthoritiesRequest) {
  const queryString = toCleanQueryString({
    page,
    size,
    search,
    requesting_institution_id: requestingInstitutionId,
    is_focal_point: isFocalPoint,
    jurisdiction_level: jurisdictionLevel,
    ...(sortBy && sortDirection
      ? { sort_by: sortBy, sort_direction: sortDirection }
      : {}),
  })
  const response = await api.get<BackendGetInstitutionAuthoritiesResponse>(
    `/institution-authorities${queryString ? `?${queryString}` : ''}`,
  )

  return {
    ...response,
    data: {
      ...response.data.pagination,
      items: response.data.items.map(mapBackendInstitutionAuthority),
    } satisfies GetInstitutionAuthoritiesResponse,
  }
}

export async function getInstitutionAuthority({
  id,
}: GetInstitutionAuthorityRequest) {
  const response = await api.get<BackendInstitutionAuthority>(
    `/institution-authorities/${id}`,
  )

  return mapBackendInstitutionAuthority(response.data)
}

export async function createInstitutionAuthority({
  name,
  requestingInstitutionId,
  isFocalPoint,
}: CreateInstitutionAuthorityRequest) {
  const response = await api.post<BackendInstitutionAuthority>(
    '/institution-authorities',
    {
      name,
      requesting_institution_id: requestingInstitutionId,
      is_focal_point: isFocalPoint,
    },
  )

  return mapBackendInstitutionAuthority(response.data)
}

export async function updateInstitutionAuthority({
  id,
  name,
  requestingInstitutionId,
  isFocalPoint,
}: UpdateInstitutionAuthorityRequest) {
  const response = await api.patch<BackendInstitutionAuthority>(
    `/institution-authorities/${id}`,
    {
      name,
      requesting_institution_id: requestingInstitutionId,
      is_focal_point: isFocalPoint,
    },
  )

  return mapBackendInstitutionAuthority(response.data)
}

export function deleteInstitutionAuthority(id: string) {
  return api.delete<void>(`/institution-authorities/${id}`)
}

export async function replaceInstitutionAuthorityContacts({
  id,
  phones,
  emails,
}: ReplaceInstitutionAuthorityContactsRequest) {
  const response = await api.put<BackendInstitutionAuthority>(
    `/institution-authorities/${id}/contacts`,
    {
      phones: phones.map((item) => ({
        phone: item.phone,
        is_primary: item.isPrimary,
      })),
      emails: emails.map((item) => ({
        email: item.email,
        is_primary: item.isPrimary,
      })),
    },
  )

  return mapBackendInstitutionAuthority(response.data)
}
