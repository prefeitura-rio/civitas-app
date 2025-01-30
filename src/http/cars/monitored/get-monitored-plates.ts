import { api } from '@/lib/api'
import type { BackendMonitoredPlate, MonitoredPlate } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

interface GetMonitoredPlatesRequest extends PaginationRequest {
  operationId?: string
  operationTitle?: string
  notificationChannelId?: string
  notificationChannelTitle?: string
  plateContains?: string
  active?: boolean
}

export interface GetMonitoredPlatesResponse extends PaginationResponse {
  items: MonitoredPlate[]
}

interface OriginalResponse extends PaginationResponse {
  items: BackendMonitoredPlate[]
}

export async function getMonitoredPlates({
  operationId,
  operationTitle,
  notificationChannelId,
  notificationChannelTitle,
  active,
  plateContains,
  page,
  size,
}: GetMonitoredPlatesRequest) {
  const originalResponse = await api.get<OriginalResponse>('cars/monitored', {
    params: {
      operation_id: operationId,
      operation_title: operationTitle,
      active,
      plate_contains: plateContains,
      notification_channel_id: notificationChannelId,
      notification_channel_title: notificationChannelTitle,
      page,
      size,
    },
  })

  const items = originalResponse.data.items.map((item) => {
    return {
      ...item,
      contactInfo: item.contact_info,
      additionalInfo: item.additional_info,
      notificationChannels: item.notification_channels,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    } as MonitoredPlate
  })

  const response = {
    ...originalResponse,
    data: {
      ...originalResponse.data,
      items,
    },
  }

  return response
}
