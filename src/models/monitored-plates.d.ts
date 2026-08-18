import type { Operation } from './operations'

export type MonitoredPlateAuthorityLink = {
  id?: string
  monitoredPlateId: string
  institutionAuthorityId: string
  referenceNumber: string
  requestedAt: string
  validUntil?: string
  active: boolean
  monitorAllCollectionPoints: boolean
  notificationChannelIds: string[]
  collectionPointIds: string[]
}

export type BackendMonitoredPlateAuthorityLink = {
  id?: string
  monitored_plate_id: string
  institution_authority_id: string
  reference_number: string
  requested_at: string
  valid_until?: string
  active: boolean
  monitor_all_collection_points: boolean
  notification_channel_ids: string[]
  collection_point_ids: string[]
}

export type VehicleType =
  | 'automovel'
  | 'motocicleta'
  | 'caminhao'
  | 'onibus'
  | 'utilitario'
  | 'van'
  | 'reboque'
  | 'trator'
  | 'outro'

export type VehicleInfoSource = 'cortex' | 'manual' | 'mixed'

export type MonitoredPlateRecord = {
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
  createdAt?: string
  updatedAt?: string
}

export type BackendMonitoredPlateRecord = {
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
  created_at?: string
  updated_at?: string
}

export type MonitoredPlateRegistrationAuthority = Omit<
  MonitoredPlateAuthorityLink,
  'monitoredPlateId' | 'id'
>

export type BackendMonitoredPlateRegistrationAuthority = Omit<
  BackendMonitoredPlateAuthorityLink,
  'monitored_plate_id' | 'id'
>

export type MonitoredPlateRegistration = {
  plate: string
  notes?: string | null
  additionalInfo?: Record<string, unknown> | null
  vehicleType?: VehicleType | null
  brand?: string | null
  model?: string | null
  modelYear?: string | null
  manufactureYear?: string | null
  color?: string | null
  vehicleInfoSource?: VehicleInfoSource | null
  authorities: MonitoredPlateRegistrationAuthority[]
}

export type BackendMonitoredPlateRegistration = {
  plate: string
  notes?: string | null
  additional_info?: Record<string, unknown> | null
  vehicle_type?: VehicleType | null
  brand?: string | null
  model?: string | null
  model_year?: string | null
  manufacture_year?: string | null
  color?: string | null
  vehicle_info_source?: VehicleInfoSource | null
  authorities: BackendMonitoredPlateRegistrationAuthority[]
}

export type NotificationChannel = {
  id: string
  title: string
  channelType: string
  active: boolean
}

export type BackendNotificationChannel = {
  id: string
  title: string
  channel_type: string
  active: boolean
}

// Legacy types — used by /cars/monitored endpoints (out of scope for new API)
export type MonitoredPlate = {
  id: string
  plate: string
  operation: Operation
  contactInfo: string | null
  notes: string
  active: boolean
  additionalInfo: JSON
  notificationChannels: NotificationChannel[]
  createdAt: string
  updatedAt: string
}

export type BackendMonitoredPlate = {
  id: string
  plate: string
  operation: Operation
  contact_info: string | null
  notes: string
  active: boolean
  additional_info: JSON
  notification_channels: NotificationChannel[]
  created_at: string
  updated_at: string
}

export type MonitoredPlateHistoryItem = {
  plate: string
  notes: string | null
  created_timestamp: string | null
  created_by: {
    id: string
    username: string
    full_name: string
    cpf: string
    registration: string
    agency: string
    sector: string
    email: string
    is_admin: boolean
  } | null
  deleted_timestamp: string | null
  deleted_by: {
    id: string
    username: string
    full_name: string
    cpf: string
    registration: string
    agency: string
    sector: string
    email: string
    is_admin: boolean
  } | null
}
