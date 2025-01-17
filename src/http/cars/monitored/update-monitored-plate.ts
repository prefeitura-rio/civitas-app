'use server'

import { api } from '@/lib/api'
import type { MonitoredPlate, Operation } from '@/models/entities'

interface UpdateMonitoredPlateRequest
  extends Partial<
    Omit<MonitoredPlate, 'id' | 'operation' | 'notificationChannels'>
  > {
  plate: MonitoredPlate['plate']
  operationId?: Operation['id']
  notificationChannels?: string[]
}

export async function updateMonitoredPlate({
  plate,
  operationId,
  contactInfo,
  notes,
  active,
  additionalInfo,
  notificationChannels,
}: UpdateMonitoredPlateRequest) {
  const response = await api.put<MonitoredPlate>(`/cars/monitored/${plate}`, {
    plate,
    operation_id: operationId,
    active,
    contact_info: contactInfo,
    notes,
    additional_info: additionalInfo,
    notification_channels: notificationChannels,
  })

  return response.data
}
