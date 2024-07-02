import { api } from '@/lib/api'
import type { MonitoredPlate, Operation } from '@/models/operation'

export interface CreateMonitoredPlateRequest
  extends Pick<MonitoredPlate, 'plate' | 'notificationChannels'>,
    Partial<Pick<MonitoredPlate, 'additionalInfo' | 'active'>> {
  operationId: Operation['id']
}

export function createMonitoredPlate({
  plate,
  operationId,
  active,
  additionalInfo,
  notificationChannels,
}: CreateMonitoredPlateRequest) {
  const response = api.post<MonitoredPlate>('/cars/monitored', {
    plate,
    operation_id: operationId,
    active,
    additional_info: additionalInfo,
    notification_channels: notificationChannels,
  })

  return response
}
