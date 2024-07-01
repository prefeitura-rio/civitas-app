import { api } from '@/lib/api'

interface DeleteMonitoredPlateResponse {
  id: string
  plate: string
  additional_info: JSON
}

export async function deleteMonitoredPlate(plate: string) {
  const response = await api.delete<DeleteMonitoredPlateResponse>(
    `cars/monitored/${plate}`,
  )

  return response
}
