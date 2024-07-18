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

export type BackendCameraCor = {
  CameraCode: string
  CameraName: string
  CameraZone: string
  Latitude: string
  Longitude: string
  Streamming: string
}

export type CameraCor = {
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
  sentido: string
}

export type Radar = {
  codcet: string
  cameraNumero: string
  latitude: number
  longitude: number
  locequip: string
  bairro: string
  logradouro: string
  sentido: string
}
