import {
  buildMonitoredPlateAuthorityActiveUpdate,
  updateMonitoredPlateAuthority,
} from '@/http/monitored-plate-authorities'
import { api } from '@/lib/api'
import type {
  BackendNotificationChannel,
  NotificationChannel,
  VehicleInfoSource,
  VehicleType,
} from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

/** Lean shape returned when institution_authority is embedded in plate responses.
 *  Contact data is intentionally absent — fetch via GET /institution-authorities/:id. */
interface BackendEmbeddedInstitutionAuthority {
  id: string
  name: string
  is_focal_point: boolean
  requesting_institution: { id: string; name: string }
}

interface BackendMonitoredPlateAuthoritySummary {
  id: string
  institution_authority: BackendEmbeddedInstitutionAuthority
  notification_channels: BackendNotificationChannel[]
  collection_point_ids: string[]
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

/** Lean authority reference embedded inside plate list/detail responses.
 *  Contact data is absent — use GET /institution-authorities/:id on demand. */
export interface EmbeddedInstitutionAuthority {
  id: string
  name: string
  requestingInstitutionId: string
  requestingInstitution: { id: string; name: string }
  isFocalPoint: boolean
  primaryContact: null
  contacts: null
}

export interface MonitoredPlateAuthoritySummary {
  id: string
  institutionAuthority: EmbeddedInstitutionAuthority
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

/** Maps the lean institution_authority shape embedded in plate list/detail
 *  responses. Contact data is absent — use GET /institution-authorities/:id. */
function mapBackendEmbeddedInstitutionAuthority(
  item: BackendEmbeddedInstitutionAuthority,
) {
  return {
    id: item.id,
    name: item.name,
    requestingInstitutionId: item.requesting_institution.id,
    requestingInstitution: {
      id: item.requesting_institution.id,
      name: item.requesting_institution.name,
    },
    primaryContact: null,
    contacts: null,
    isFocalPoint: item.is_focal_point,
  }
}

function mapBackendNotificationChannel(
  item: BackendNotificationChannel,
): NotificationChannel {
  return {
    id: item.id,
    title: item.title ?? '',
    channelType: item.channel_type,
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
      institutionAuthority: mapBackendEmbeddedInstitutionAuthority(
        authority.institution_authority,
      ),
      notificationChannels: authority.notification_channels.map(
        mapBackendNotificationChannel,
      ),
      collectionPointIds: authority.collection_point_ids,
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

const UNLINKED_PLATES_FETCH_SIZE = 100

/** TODO(pending-cadastro) — client-side filter; delete with the pending cadastro option. */
export async function getMonitoredPlatesWithoutAuthorities({
  page = 1,
  size = 10,
  plateContains,
  notificationChannelId,
  startTimeCreate,
  endTimeCreate,
  sortBy,
  sortDirection,
}: Omit<GetMonitoredPlatesRequest, 'active' | 'institutionAuthorityId'>) {
  const unlinked: MonitoredPlateReadModel[] = []
  let currentPage = 1
  let pages = 1

  do {
    const response = await getMonitoredPlates({
      page: currentPage,
      size: UNLINKED_PLATES_FETCH_SIZE,
      plateContains,
      notificationChannelId,
      startTimeCreate,
      endTimeCreate,
      sortBy,
      sortDirection,
    })
    unlinked.push(
      ...response.data.items.filter((item) => item.authorities.length === 0),
    )
    pages = response.data.pages
    currentPage += 1
  } while (currentPage <= pages)

  const start = (page - 1) * size

  return {
    data: {
      items: unlinked.slice(start, start + size),
      total: unlinked.length,
      page,
      size,
      pages: Math.max(1, Math.ceil(unlinked.length / size) || 1),
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
