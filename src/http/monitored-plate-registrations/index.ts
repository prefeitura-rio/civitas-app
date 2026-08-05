import { api } from '@/lib/api'
import type { MonitoredPlateRegistration } from '@/models/entities'

import {
  mapBackendMonitoredPlate,
  type MonitoredPlateReadModel,
} from '../monitored-plates'

interface BackendMonitoredPlateAuthoritySummary {
  id: string
  institution_authority: unknown
  notification_channels: unknown[]
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
  authorities: BackendMonitoredPlateAuthoritySummary[]
  created_at: string | null
  updated_at: string | null
}

export interface CreateMonitoredPlateRegistrationRequest
  extends MonitoredPlateRegistration {}

export async function createMonitoredPlateRegistration({
  plate,
  notes,
  additionalInfo,
  authorities,
}: CreateMonitoredPlateRegistrationRequest): Promise<MonitoredPlateReadModel> {
  const response = await api.post<BackendMonitoredPlateResponse>(
    '/monitored-plate-registrations',
    {
      plate,
      notes,
      additional_info: additionalInfo,
      authorities: authorities.map((item) => ({
        institution_authority_id: item.institutionAuthorityId,
        reference_number: item.referenceNumber,
        requested_at: item.requestedAt,
        valid_until: item.validUntil,
        active: item.active,
        monitor_all_collection_points: item.monitorAllCollectionPoints,
        notification_channel_ids: item.notificationChannelIds,
        collection_point_ids: item.collectionPointIds,
      })),
    },
  )

  return mapBackendMonitoredPlate(response.data as never)
}
