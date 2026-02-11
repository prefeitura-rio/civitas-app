import { api } from '@/lib/api'
import type { BackendCamera, Camera } from '@/models/entities'

export async function getCamera() {
  const response = await api.get<BackendCamera[]>('/cameras')

  const data = response.data.map((item) => {
    return {
      code: item.CameraCode,
      location: item.CameraName,
      zone: item.CameraZone,
      streamingUrl: item.Streamming,
      latitude: Number(item.Latitude),
      longitude: Number(item.Longitude),
      sistemaOrigem: item.sistema_origem,
    } as Camera
  })

  return data
}
