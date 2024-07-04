import { api } from '@/lib/api'
import type { MonitoredPlate } from '@/models/entities'

interface GetMonitoredPlateRequest {
  plate: string
}

export type GetMonitoredPlatesResponse = MonitoredPlate

export function getMonitoredPlate({ plate }: GetMonitoredPlateRequest) {
  const response = api.get<GetMonitoredPlatesResponse>('cars/monitored', {
    params: {
      plate,
    },
  })

  return response
}
