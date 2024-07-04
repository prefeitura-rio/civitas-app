import { api } from '@/lib/api'
import type { MonitoredPlate, Operation } from '@/models/entities'

interface UpdateMonitoredPlateRequest
  extends Partial<
    Pick<
      MonitoredPlate,
      'plate' | 'active' | 'additionalInfo' | 'notificationChannels'
    >
  > {
  operationId?: Operation['id']
}

interface UpdateMonitoredPlateResponse {
  id: string
  plate: string
  additionalInfo: JSON
  notificationChannels: string[]
}

export function updateMonitoredPlate({
  plate,
  operationId,
  active,
  additionalInfo,
  notificationChannels,
}: UpdateMonitoredPlateRequest) {
  const response = api.put<UpdateMonitoredPlateResponse>(
    `/cars/monitored/${plate}`,
    {
      plate,
      operation_id: operationId,
      active,
      additional_info: additionalInfo,
      notification_channels: notificationChannels,
    },
  )

  return response
}
