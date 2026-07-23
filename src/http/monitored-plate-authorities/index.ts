import { api } from '@/lib/api'
import type {
  BackendInstitutionAuthority,
  BackendMonitoredPlateAuthorityLink,
  BackendNotificationChannel,
  InstitutionAuthority,
  MonitoredPlateAuthorityLink,
  NotificationChannel,
} from '@/models/entities'

interface BackendMonitoredPlateAuthorityCollectionPoint {
  lpr_collection_point_id?: string
}

interface BackendMonitoredPlateAuthorityResponse extends BackendMonitoredPlateAuthorityLink {
  institution_authority?: BackendInstitutionAuthority
  notification_channels?: BackendNotificationChannel[]
  collection_points?: BackendMonitoredPlateAuthorityCollectionPoint[]
  created_at?: string | null
  updated_at?: string | null
}

export interface MonitoredPlateAuthorityRecord extends MonitoredPlateAuthorityLink {
  institutionAuthority?: InstitutionAuthority
  notificationChannels?: NotificationChannel[]
  createdAt?: string | null
  updatedAt?: string | null
}

interface GetMonitoredPlateAuthorityRequest {
  id: string
}

export interface CreateMonitoredPlateAuthorityRequest extends Omit<
  MonitoredPlateAuthorityLink,
  'id'
> {}

export interface UpdateMonitoredPlateAuthorityRequest extends Partial<
  Omit<
    MonitoredPlateAuthorityLink,
    'id' | 'monitoredPlateId' | 'institutionAuthorityId'
  >
> {
  id: string
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

function mapBackendMonitoredPlateAuthority(
  item: BackendMonitoredPlateAuthorityResponse,
): MonitoredPlateAuthorityRecord {
  return {
    id: item.id,
    monitoredPlateId: item.monitored_plate_id,
    institutionAuthorityId: item.institution_authority_id,
    referenceNumber: item.reference_number,
    requestedAt: item.requested_at,
    validUntil: item.valid_until ?? undefined,
    active: item.active,
    monitorAllCollectionPoints: item.monitor_all_collection_points,
    notificationChannelIds: item.notification_channel_ids ?? [],
    collectionPointIds:
      item.collection_point_ids && item.collection_point_ids.length > 0
        ? item.collection_point_ids
        : (item.collection_points
            ?.map(
              (collectionPoint) =>
                collectionPoint.lpr_collection_point_id ?? '',
            )
            .filter(Boolean) ?? []),
    institutionAuthority: item.institution_authority
      ? mapBackendInstitutionAuthority(item.institution_authority)
      : undefined,
    notificationChannels: item.notification_channels?.map(
      mapBackendNotificationChannel,
    ),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export async function getMonitoredPlateAuthority({
  id,
}: GetMonitoredPlateAuthorityRequest) {
  const response = await api.get<BackendMonitoredPlateAuthorityResponse>(
    `/monitored-plate-authorities/${id}`,
  )

  return mapBackendMonitoredPlateAuthority(response.data)
}

export async function createMonitoredPlateAuthority({
  monitoredPlateId,
  institutionAuthorityId,
  referenceNumber,
  requestedAt,
  validUntil,
  active,
  monitorAllCollectionPoints,
  notificationChannelIds,
  collectionPointIds,
}: CreateMonitoredPlateAuthorityRequest) {
  const response = await api.post<BackendMonitoredPlateAuthorityResponse>(
    '/monitored-plate-authorities/',
    {
      monitored_plate_id: monitoredPlateId,
      institution_authority_id: institutionAuthorityId,
      reference_number: referenceNumber,
      requested_at: requestedAt,
      valid_until: validUntil,
      active,
      monitor_all_collection_points: monitorAllCollectionPoints,
      notification_channel_ids: notificationChannelIds,
      collection_point_ids: collectionPointIds,
    },
  )

  return mapBackendMonitoredPlateAuthority(response.data)
}

export async function updateMonitoredPlateAuthority({
  id,
  referenceNumber,
  requestedAt,
  validUntil,
  active,
  monitorAllCollectionPoints,
  notificationChannelIds,
  collectionPointIds,
}: UpdateMonitoredPlateAuthorityRequest) {
  const response = await api.patch<BackendMonitoredPlateAuthorityResponse>(
    `/monitored-plate-authorities/${id}`,
    {
      reference_number: referenceNumber,
      requested_at: requestedAt,
      valid_until: validUntil,
      active,
      monitor_all_collection_points: monitorAllCollectionPoints,
      notification_channel_ids: notificationChannelIds,
      collection_point_ids: collectionPointIds,
    },
  )

  return mapBackendMonitoredPlateAuthority(response.data)
}

export function deleteMonitoredPlateAuthority(id: string) {
  return api.delete(`/monitored-plate-authorities/${id}`)
}
