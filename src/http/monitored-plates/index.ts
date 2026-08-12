import {
  buildMonitoredPlateAuthorityActiveUpdate,
  updateMonitoredPlateAuthority,
} from '@/http/monitored-plate-authorities'
import { api } from '@/lib/api'
import type {
  BackendInstitutionAuthority,
  BackendNotificationChannel,
  InstitutionAuthority,
  NotificationChannel,
  VehicleInfoSource,
  VehicleType,
} from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

interface BackendMonitoredPlateAuthorityCollectionPointSummary {
  id: string
  lpr_collection_point_id?: string
  active: boolean
  created_at: string | null
  updated_at: string | null
}

interface BackendMonitoredPlateAuthoritySummary {
  id: string
  institution_authority: BackendInstitutionAuthority
  notification_channels: BackendNotificationChannel[]
  collection_point_ids?: string[]
  collection_points?: BackendMonitoredPlateAuthorityCollectionPointSummary[]
  reference_number: string
  valid_until: string
  active: boolean
  monitor_all_collection_points: boolean
  requested_at: string
  created_at: string | null
  updated_at: string | null
}

interface BackendMonitoredPlateResponse {
  id: string
  plate: string
  active: boolean
  notes: string | null
  additional_info: Record<string, unknown> | null
  vehicle_type: VehicleType | null
  brand: string | null
  model: string | null
  model_year: string | null
  manufacture_year: string | null
  color: string | null
  vehicle_info_source: VehicleInfoSource | null
  authorities: BackendMonitoredPlateAuthoritySummary[]
  created_at: string | null
  updated_at: string | null
}

interface BackendGetMonitoredPlatesResponse {
  items: BackendMonitoredPlateResponse[]
  pagination: PaginationResponse
}

export interface MonitoredPlateAuthoritySummary {
  id: string
  institutionAuthority: InstitutionAuthority
  notificationChannels: NotificationChannel[]
  collectionPointIds: string[]
  referenceNumber: string
  validUntil: string
  active: boolean
  monitorAllCollectionPoints: boolean
  requestedAt: string
  createdAt: string | null
  updatedAt: string | null
}

export interface MonitoredPlateReadModel {
  id: string
  plate: string
  active: boolean
  notes: string | null
  additionalInfo: Record<string, unknown> | null
  vehicleType: VehicleType | null
  brand: string | null
  model: string | null
  modelYear: string | null
  manufactureYear: string | null
  color: string | null
  vehicleInfoSource: VehicleInfoSource | null
  authorities: MonitoredPlateAuthoritySummary[]
  createdAt: string | null
  updatedAt: string | null
}

export interface GetMonitoredPlatesResponse extends PaginationResponse {
  items: MonitoredPlateReadModel[]
}

interface GetMonitoredPlateRequest {
  plate: string
}

export type MonitoredPlatesSortBy =
  | 'plate'
  | 'active'
  | 'created_at'
  | 'updated_at'

export type SortDirection = 'asc' | 'desc'

export interface GetMonitoredPlatesRequest extends PaginationRequest {
  active?: boolean
  plateContains?: string
  institutionAuthorityId?: string
  notificationChannelId?: string
  requestingInstitutionId?: string
  referenceNumberContains?: string
  notesContains?: string
  startTimeCreate?: string
  endTimeCreate?: string
  validUntilFrom?: string
  validUntilTo?: string
  sortBy?: MonitoredPlatesSortBy
  sortDirection?: SortDirection
}

export type VehicleFields = Partial<
  Pick<
    MonitoredPlateReadModel,
    | 'vehicleType'
    | 'brand'
    | 'model'
    | 'modelYear'
    | 'manufactureYear'
    | 'color'
    | 'vehicleInfoSource'
  >
>

export interface CreateMonitoredPlateRequest
  extends Pick<MonitoredPlateReadModel, 'plate'>,
    Partial<Pick<MonitoredPlateReadModel, 'notes' | 'additionalInfo'>>,
    VehicleFields {}

export interface UpdateMonitoredPlateRequest
  extends Partial<Pick<MonitoredPlateReadModel, 'notes' | 'additionalInfo'>>,
    VehicleFields {
  plate: string
}

function mapBackendRequestingInstitution(
  item?: BackendInstitutionAuthority['requesting_institution'],
) {
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

function mapBackendPhone(item: {
  id?: string
  phone: string
  is_primary: boolean
}) {
  return {
    id: item.id,
    phone: item.phone,
    isPrimary: item.is_primary,
  }
}

function mapBackendEmail(item: {
  id?: string
  email: string
  is_primary: boolean
}) {
  return {
    id: item.id,
    email: item.email,
    isPrimary: item.is_primary,
  }
}

function mapBackendInstitutionAuthority(
  item: BackendInstitutionAuthority,
): InstitutionAuthority {
  const requestingInstitution = mapBackendRequestingInstitution(
    item.requesting_institution,
  )
  const contacts = item.contact
    ? {
        phones: (item.contact.phones ?? []).map(mapBackendPhone),
        emails: (item.contact.emails ?? []).map(mapBackendEmail),
      }
    : null
  const primaryContact = item.primary_contact
    ? {
        phone: item.primary_contact.phone
          ? mapBackendPhone(item.primary_contact.phone)
          : undefined,
        email: item.primary_contact.email
          ? mapBackendEmail(item.primary_contact.email)
          : undefined,
      }
    : {
        phone:
          contacts?.phones.find((contact) => contact.isPrimary) ??
          contacts?.phones.at(0),
        email:
          contacts?.emails.find((contact) => contact.isPrimary) ??
          contacts?.emails.at(0),
      }

  return {
    id: item.id,
    name: item.name,
    requestingInstitutionId:
      item.requesting_institution_id ?? requestingInstitution?.id ?? '',
    requestingInstitution,
    primaryContact,
    contacts,
    isFocalPoint: item.is_focal_point,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

function mapBackendNotificationChannel(
  item: BackendNotificationChannel,
): NotificationChannel {
  return {
    id: item.id,
    title: item.title ?? '',
    channelType: item.channel_type,
    parameters: item.parameters,
    active: item.active,
  }
}

export function mapBackendMonitoredPlate(
  item: BackendMonitoredPlateResponse,
): MonitoredPlateReadModel {
  return {
    id: item.id,
    plate: item.plate,
    active: item.active,
    notes: item.notes,
    additionalInfo: item.additional_info,
    vehicleType: item.vehicle_type,
    brand: item.brand,
    model: item.model,
    modelYear: item.model_year,
    manufactureYear: item.manufacture_year,
    color: item.color,
    vehicleInfoSource: item.vehicle_info_source,
    authorities: item.authorities.map((authority) => ({
      id: authority.id,
      institutionAuthority: mapBackendInstitutionAuthority(
        authority.institution_authority,
      ),
      notificationChannels: authority.notification_channels.map(
        mapBackendNotificationChannel,
      ),
      collectionPointIds:
        authority.collection_point_ids &&
        authority.collection_point_ids.length > 0
          ? authority.collection_point_ids
          : (authority.collection_points
              ?.map(
                (collectionPoint) =>
                  collectionPoint.lpr_collection_point_id ?? '',
              )
              .filter(Boolean) ?? []),
      referenceNumber: authority.reference_number,
      validUntil: authority.valid_until,
      active: authority.active,
      monitorAllCollectionPoints: authority.monitor_all_collection_points,
      requestedAt: authority.requested_at,
      createdAt: authority.created_at,
      updatedAt: authority.updated_at,
    })),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export async function getMonitoredPlates({
  page,
  size,
  active,
  plateContains,
  institutionAuthorityId,
  notificationChannelId,
  requestingInstitutionId,
  referenceNumberContains,
  notesContains,
  startTimeCreate,
  endTimeCreate,
  validUntilFrom,
  validUntilTo,
  sortBy,
  sortDirection,
}: GetMonitoredPlatesRequest) {
  const response = await api.get<BackendGetMonitoredPlatesResponse>(
    '/monitored-plates',
    {
      params: {
        page,
        size,
        active,
        plate_contains: plateContains,
        institution_authority_id: institutionAuthorityId,
        notification_channel_id: notificationChannelId,
        requesting_institution_id: requestingInstitutionId,
        reference_number_contains: referenceNumberContains,
        notes_contains: notesContains,
        start_time_create: startTimeCreate,
        end_time_create: endTimeCreate,
        valid_until_from: validUntilFrom,
        valid_until_to: validUntilTo,
        ...(sortBy && sortDirection
          ? { sort_by: sortBy, sort_direction: sortDirection }
          : {}),
      },
    },
  )

  return {
    ...response,
    data: {
      ...response.data.pagination,
      items: response.data.items.map(mapBackendMonitoredPlate),
    } satisfies GetMonitoredPlatesResponse,
  }
}

export async function getMonitoredPlate({ plate }: GetMonitoredPlateRequest) {
  const response = await api.get<BackendMonitoredPlateResponse>(
    `/monitored-plates/${plate}`,
  )

  return mapBackendMonitoredPlate(response.data)
}

export async function createMonitoredPlate({
  plate,
  notes,
  additionalInfo,
  vehicleType,
  brand,
  model,
  modelYear,
  manufactureYear,
  color,
  vehicleInfoSource,
}: CreateMonitoredPlateRequest) {
  const response = await api.post<BackendMonitoredPlateResponse>(
    '/monitored-plates',
    {
      plate,
      notes,
      additional_info: additionalInfo,
      vehicle_type: vehicleType ?? null,
      brand: brand ?? null,
      model: model ?? null,
      model_year: modelYear ?? null,
      manufacture_year: manufactureYear ?? null,
      color: color ?? null,
      vehicle_info_source: vehicleInfoSource ?? null,
    },
  )

  return mapBackendMonitoredPlate(response.data)
}

export async function updateMonitoredPlate({
  plate,
  notes,
  additionalInfo,
  vehicleType,
  brand,
  model,
  modelYear,
  manufactureYear,
  color,
  vehicleInfoSource,
}: UpdateMonitoredPlateRequest) {
  const response = await api.patch<BackendMonitoredPlateResponse>(
    `/monitored-plates/${plate}`,
    {
      notes,
      additional_info: additionalInfo,
      vehicle_type: vehicleType ?? null,
      brand: brand ?? null,
      model: model ?? null,
      model_year: modelYear ?? null,
      manufacture_year: manufactureYear ?? null,
      color: color ?? null,
      vehicle_info_source: vehicleInfoSource ?? null,
    },
  )

  return mapBackendMonitoredPlate(response.data)
}

export async function deactivateMonitoredPlateAuthorityLinks(plate: string) {
  const monitoredPlate = await getMonitoredPlate({ plate })
  const activeLinks = monitoredPlate.authorities.filter((link) => link.active)

  await Promise.all(
    activeLinks.map((link) =>
      updateMonitoredPlateAuthority(
        buildMonitoredPlateAuthorityActiveUpdate(link, false),
      ),
    ),
  )

  return monitoredPlate
}
