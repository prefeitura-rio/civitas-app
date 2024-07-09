import { api } from '@/lib/api'
import type { BackendMonitoredPlate, MonitoredPlate } from '@/models/entities'

interface GetMonitoredPlateRequest {
  plate: string
}

export async function getMonitoredPlate({ plate }: GetMonitoredPlateRequest) {
  const originalResponse = await api.get<BackendMonitoredPlate>(
    `cars/monitored/${plate}`,
  )

  const response = {
    ...originalResponse,
    data: {
      ...originalResponse.data,
      additionalInfo: originalResponse.data.additional_info,
      notificationChannels: originalResponse.data.notification_channels,
    } as MonitoredPlate,
  }

  return response
}
