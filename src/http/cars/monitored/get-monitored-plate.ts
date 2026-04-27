import { api } from '@/lib/api'
import type { BackendMonitoredPlate } from '@/models/entities'

import { mapBackendMonitoredPlateToMonitoredPlate } from './map-backend-monitored-plate'

interface GetMonitoredPlateRequest {
  plate: string
}

export async function getMonitoredPlate({ plate }: GetMonitoredPlateRequest) {
  const response = await api.get<BackendMonitoredPlate>(
    `cars/monitored/${plate}`,
  )

  return mapBackendMonitoredPlateToMonitoredPlate(response.data)
}
