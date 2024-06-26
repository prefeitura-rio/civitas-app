import { api } from '@/lib/api'

interface UpdateMonitoredPlateRequest {
  plate: string
  additionalInfo?: JSON
  notificationChannels?: string[]
}

interface UpdateMonitoredPlateResponse {
  id: string
  plate: string
  additionalInfo: JSON
  notificationChannels: string[]
}

export function updateMonitoredPlate({
  plate,
  additionalInfo,
  notificationChannels,
}: UpdateMonitoredPlateRequest) {
  const response = api.put<UpdateMonitoredPlateResponse>(
    `/cars/monitored/${plate}`,
    {
      additional_info: additionalInfo,
      notification_channels: notificationChannels,
    },
  )

  return response
}
