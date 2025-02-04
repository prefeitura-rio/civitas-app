import { api } from '@/lib/api'
import type { MonitoredPlateHistoryItem } from '@/models/entities'
import type { PaginationResponse } from '@/models/pagination'

export interface GetMonitoredPlatesHistoryProps {
  plate?: string
  startTimeCreate?: string
  endTimeCreate?: string
  startTimeDelete?: string
  endTimeDelete?: string
  page?: number
  size?: number
}

interface GetMonitoredPlatesHistoryResponse extends PaginationResponse {
  items: MonitoredPlateHistoryItem[]
}

export async function getMonitoredPlatesHistory(
  props: GetMonitoredPlatesHistoryProps,
) {
  const response = await api.get<GetMonitoredPlatesHistoryResponse>(
    '/cars/monitored/history',
    {
      params: {
        plate: props.plate,
        start_time_create: props.startTimeCreate,
        end_time_create: props.endTimeCreate,
        start_time_delete: props.startTimeDelete,
        end_time_delete: props.endTimeDelete,
        page: props.page,
        size: props.size,
      },
    },
  )

  return response.data
}
