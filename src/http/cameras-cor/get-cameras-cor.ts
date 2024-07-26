import { api } from '@/lib/api'
import type { BackendCameraCOR, CameraCOR } from '@/models/entities'

export async function getCameraCOR() {
  const response = await api.get<BackendCameraCOR[]>('/cameras-cor')

  const data = response.data.map((item) => {
    return {
      code: item.CameraCode,
      location: item.CameraName,
      zone: item.CameraZone,
      streamingUrl: item.Streamming,
      latitude: Number(item.Latitude),
      longitude: Number(item.Longitude),
    } as CameraCOR
  })
  return {
    ...response,
    data,
  }
}
