import { api } from '@/lib/api'
import type {
  BackendMonitoredPlate,
  MonitoredPlate,
  Operation,
} from '@/models/entities'

export interface CreateMonitoredPlateRequest
  extends Pick<MonitoredPlate, 'plate'>,
    Partial<Pick<MonitoredPlate, 'additionalInfo' | 'active' | 'notes'>> {
  operationId: Operation['id']
  notificationChannels: string[]
}

export function createMonitoredPlate({
  plate,
  operationId,
  active,
  notes,
  additionalInfo,
  notificationChannels,
}: CreateMonitoredPlateRequest) {
  const response = api.post<BackendMonitoredPlate>('/cars/monitored', {
    plate,
    operation_id: operationId,
    notes,
    active,
    additional_info: additionalInfo,
    notification_channels: notificationChannels,
  })

  return response
}
