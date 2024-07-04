import { api } from '@/lib/api'
import type { BackendMonitoredPlate, MonitoredPlate } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

interface GetMonitoredPlatesRequest extends PaginationRequest {}

export interface GetMonitoredPlatesResponse extends PaginationResponse {
  items: MonitoredPlate[]
}

interface OriginalResponse extends PaginationResponse {
  items: BackendMonitoredPlate[]
}

export async function getMonitoredPlates({
  page,
  size,
}: GetMonitoredPlatesRequest) {
  const originalResponse = await api.get<OriginalResponse>('cars/monitored', {
    params: {
      page,
      size,
    },
  })

  const items = originalResponse.data.items.map((item) => {
    return {
      ...item,
      additionalInfo: item.additional_info,
      notificationChannels: item.notification_channels,
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
