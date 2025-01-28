'use server'

import { api } from '@/lib/api'
import type {
  BackendMonitoredPlate,
  MonitoredPlate,
  Operation,
} from '@/models/entities'
import { isConflictError } from '@/utils/others/error-handlers'

export interface CreateMonitoredPlateRequest
  extends Pick<MonitoredPlate, 'plate'>,
    Partial<
      Pick<
        MonitoredPlate,
        'additionalInfo' | 'active' | 'notes' | 'contactInfo'
      >
    > {
  operationId: Operation['id']
  notificationChannels: string[]
}

export async function createMonitoredPlate({
  plate,
  operationId,
  active,
  contactInfo,
  notes,
  additionalInfo,
  notificationChannels,
}: CreateMonitoredPlateRequest) {
  try {
    const response = await api.post<BackendMonitoredPlate>('/cars/monitored', {
      plate,
      operation_id: operationId,
      contact_info: contactInfo,
      notes,
      active,
      additional_info: additionalInfo,
      notification_channels: notificationChannels,
    })

    return response.data
  } catch (error) {
    if (isConflictError(error)) {
      return { error: 'Conflict', plate }
    }
    throw error
  }
}
