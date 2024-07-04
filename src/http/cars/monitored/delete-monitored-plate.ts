import { api } from '@/lib/api'
import type { MonitoredPlate } from '@/models/entities'

export async function deleteMonitoredPlate(plate: string) {
  const response = await api.delete<MonitoredPlate>(`cars/monitored/${plate}`)

  return response
}
