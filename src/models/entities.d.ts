export type Point = {
  index: number
  from: [longitude: number, latitude: number]
  startTime: string
  to?: [longitude: number, latitude: number]
  endTime?: string
  cameraNumber: string
  district: string
  location: string
  direction: string
  lane: string
  secondsToNextPoint: number | null
  cloneAlert: boolean
}

export type Trip = {
  index: number
  cloneAlert: boolean
  points: Point[]
}

export type Operation = {
  id: string
  title: string
  description: string
}

export type NotificationChannel = {
  id: string
  title: string
  channelType: string
  parameters: JSON
  active: boolean
}

export type BackendNotificationChannel = {
  id: string
  title: string
  channel_type: string
  parameters: JSON
  active: boolean
}

export type MonitoredPlate = {
  id: string
  plate: string
  operation: Operation
  notes: string
  active: boolean
  additionalInfo: JSON
  notificationChannels: NotificationChannel[]
}

export type BackendMonitoredPlate = {
  id: string
  plate: string
  operation: Operation
  notes: string
  active: boolean
  additional_info: JSON
  notification_channels: NotificationChannel[]
}

export type AdditionalInfo = {
  Operação?: string
}

export type BackendProfile = {
  id: string
  username: string
  full_name: string
  cpf: string
  registration: string
  agency: string
  sector: string
  email: string
  is_admin: boolean
}

export type Profile = {
  id: string
  username: string
  fullName: string
  cpf: string
  registration: string
  agency: string
  sector: string
  email: string
  isAdmin: boolean
}

export type BackendCameraCOR = {
  CameraCode: string
  CameraName: string
  CameraZone: string
  Latitude: string
  Longitude: string
  Streamming: string
}

export type CameraCOR = {
  code: string
  location: string
  zone: string
  latitude: number
  longitude: number
  streamingUrl: string
}

export type BackendRadar = {
  codcet: string
  camera_numero: string
  latitude: number
  longitude: number
  locequip: string
  bairro: string
  logradouro: string
  has_data: string
  empresa?: string
  active_in_last_24_hours?: string
  last_detection_time?: string
  sentido?: string
}

export type Radar = {
  cetRioCode: string
  cameraNumber: string
  latitude: number
  longitude: number
  location: string
  district: string
  streetName: string
  hasData: boolean
  activeInLast24Hours: boolean
  company: string | null
  lastDetectionTime: string | null
  direction: string | null
}

export type BackendWazeAlert = {
  timestamp: string
  street?: string
  type: string
  subtype: string
  reliability: number
  confidence: number
  number_thumbs_up?: number
  latitude: number
  longitude: number
}

export type WazeAlert = {
  timestamp: string
  street?: string
  type: string
  subtype: string
  reliability: number
  confidence: number
  numberThumbsUp?: number
  latitude: number
  longitude: number
}

export interface RadarRegistry {
  plate: string
  timestamp: string
}
