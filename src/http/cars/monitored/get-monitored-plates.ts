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
  createdAtFrom?: string
  createdAtTo?: string
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
  createdAtFrom,
  createdAtTo,
}: GetMonitoredPlatesRequest) {
  const searchParams = new URLSearchParams()
  if (operationId) searchParams.set('operation_id', operationId)
  if (operationTitle) searchParams.set('operation_title', operationTitle)
  if (notificationChannelId)
    searchParams.set('notification_channel_id', notificationChannelId)
  if (notificationChannelTitle)
    searchParams.set('notification_channel_title', notificationChannelTitle)
  if (plateContains) searchParams.set('plate_contains', plateContains)
  if (typeof active !== 'undefined') searchParams.set('active', String(active))
  if (page) searchParams.set('page', String(page))
  if (size) searchParams.set('size', String(size))
  if (createdAtFrom) searchParams.set('start_time_create', createdAtFrom)
  if (createdAtTo) searchParams.set('end_time_create', createdAtTo)

  const originalResponse = await api.get<OriginalResponse>(
    `cars/monitored?${searchParams.toString()}`,
  )

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
