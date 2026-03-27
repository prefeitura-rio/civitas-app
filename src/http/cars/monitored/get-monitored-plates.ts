import { api } from '@/lib/api'
import type { BackendMonitoredPlate, MonitoredPlate } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

import { mapBackendMonitoredPlateToMonitoredPlate } from './map-backend-monitored-plate'

interface GetMonitoredPlatesRequest extends PaginationRequest {
  organizationId?: string
  organizationName?: string
  demandantLinkActive?: boolean
  notificationChannelId?: string
  notificationChannelTitle?: string
  plateContains?: string
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
  organizationId,
  organizationName,
  demandantLinkActive,
  notificationChannelId,
  notificationChannelTitle,
  plateContains,
  page,
  size,
  createdAtFrom,
  createdAtTo,
}: GetMonitoredPlatesRequest) {
  const searchParams = new URLSearchParams()
  if (organizationId) searchParams.set('organization_id', organizationId)
  if (organizationName) searchParams.set('organization_name', organizationName)
  if (typeof demandantLinkActive !== 'undefined')
    searchParams.set('demandant_link_active', String(demandantLinkActive))
  if (notificationChannelId)
    searchParams.set('notification_channel_id', notificationChannelId)
  if (notificationChannelTitle)
    searchParams.set('notification_channel_title', notificationChannelTitle)
  if (plateContains) searchParams.set('plate_contains', plateContains)
  if (page) searchParams.set('page', String(page))
  if (size) searchParams.set('size', String(size))
  if (createdAtFrom) searchParams.set('start_time_create', createdAtFrom)
  if (createdAtTo) searchParams.set('end_time_create', createdAtTo)

  const originalResponse = await api.get<OriginalResponse>(
    `cars/monitored?${searchParams.toString()}`,
  )

  const items = originalResponse.data.items.map((item) =>
    mapBackendMonitoredPlateToMonitoredPlate(item),
  )

  const response = {
    ...originalResponse,
    data: {
      ...originalResponse.data,
      items,
    },
  }

  return response
}
