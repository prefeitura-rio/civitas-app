'use server'

import { api } from '@/lib/api'
import type { BackendMonitoredPlate } from '@/models/entities'

export async function deleteMonitoredPlate(plate: string) {
  const response = await api.delete<BackendMonitoredPlate>(
    `cars/monitored/${plate}`,
  )

  return response
}
