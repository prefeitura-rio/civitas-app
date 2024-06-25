import { api } from '@/lib/api'

interface GetMonitoredPlatesRequest {
  page?: number
  size?: number
}

export type MonitoredPlate = {
  id: string
  plate: string
  additional_info: JSON
}

export interface GetMonitoredPlatesResponse {
  items: MonitoredPlate[]
  total: number
  page: number
  size: number
  pages: number
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
