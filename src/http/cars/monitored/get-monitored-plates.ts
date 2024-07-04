import { api } from '@/lib/api'
import type { MonitoredPlate } from '@/models/entities'
import type { PaginationRequest, PaginationResponse } from '@/models/pagination'

interface GetMonitoredPlatesRequest extends PaginationRequest {}

export interface GetMonitoredPlatesResponse extends PaginationResponse {
  items: MonitoredPlate[]
}

export function getMonitoredPlates({ page, size }: GetMonitoredPlatesRequest) {
  const response = api.get<GetMonitoredPlatesResponse>('cars/monitored', {
    params: {
      page,
      size,
    },
  })

  return response
}
