import { api } from '@/lib/api'

export interface CreateMonitoredPlateRequest {
  plate: string
  additionalInfo?: JSON
  notificationChannels?: string[]
}

interface CreateMonitoredPlateResponse {
  id: string
  plate: string
  additionalInfo: JSON
  notificationChannels: string[]
}

export function createMonitoredPlate({
  plate,
  additionalInfo,
  notificationChannels,
}: CreateMonitoredPlateRequest) {
  const response = api.post<CreateMonitoredPlateResponse>('/cars/monitored', {
    plate,
    additional_info: additionalInfo,
    notification_channels: notificationChannels,
  })

  return response
}
