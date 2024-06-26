import { api } from '@/lib/api'

interface DeleteMonitoredPlateResponse {
  id: string
  plate: string
  additional_info: any
}

export async function deleteMonitoredPlate(id: string) {
  const response = await api.get<DeleteMonitoredPlateResponse>(
    `cars/monitored/${id}`,
  )

  return response
}
