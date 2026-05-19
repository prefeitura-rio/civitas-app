import { api } from '@/lib/api'
import type { BackendMonitoredPlate } from '@/models/entities'

import { mapBackendMonitoredPlateToMonitoredPlate } from './map-backend-monitored-plate'

export async function deleteMonitoredPlateDemandantLink({
  plate,
  linkId,
}: {
  plate: string
  linkId: string
}) {
  const response = await api.delete<BackendMonitoredPlate>(
    `cars/monitored/${plate}/demandant-links/${linkId}`,
  )

  return mapBackendMonitoredPlateToMonitoredPlate(response.data)
}
