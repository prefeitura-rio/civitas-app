import { api } from '@/lib/api'
import type { BackendMonitoredPlate, MonitoredPlate } from '@/models/entities'

interface GetMonitoredPlateRequest {
  plate: string
}

export async function getMonitoredPlate({ plate }: GetMonitoredPlateRequest) {
  const response = await api.get<BackendMonitoredPlate>(
    `cars/monitored/${plate}`,
  )

  const data = {
    id: response.data.id,
    plate: response.data.plate,
    active: response.data.active,
    notes: response.data.notes,
    operation: {
      id: response.data.operation.id,
      title: response.data.operation.title,
    },
    createdAt: response.data.created_at,
    updatedAt: response.data.created_at,
    additionalInfo: response.data.additional_info,
    notificationChannels: response.data.notification_channels,
  } as MonitoredPlate

  return data
}
