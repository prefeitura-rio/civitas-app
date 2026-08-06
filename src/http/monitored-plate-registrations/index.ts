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
  vehicle_type: string | null
  brand: string | null
  model: string | null
  model_year: string | null
  manufacture_year: string | null
  color: string | null
  vehicle_info_source: string | null
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
  vehicleType,
  brand,
  model,
  modelYear,
  manufactureYear,
  color,
  vehicleInfoSource,
  authorities,
}: CreateMonitoredPlateRegistrationRequest): Promise<MonitoredPlateReadModel> {
  const response = await api.post<BackendMonitoredPlateResponse>(
    '/monitored-plate-registrations',
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
