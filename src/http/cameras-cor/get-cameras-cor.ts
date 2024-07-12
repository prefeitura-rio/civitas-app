import { api } from '@/lib/api'
import type { BackendCameraCor, CameraCor } from '@/models/entities'

export async function getCamerasCor() {
  const response = await api.get<BackendCameraCor[]>('/cameras-cor')

  const data = response.data.map((item) => {
    return {
      code: item.CameraCode,
      location: item.CameraName,
      zone: item.CameraZone,
      streamingUrl: item.Streamming,
      latitude: Number(item.Latitude),
      longitude: Number(item.Longitude),
    } as CameraCor
  })
  return {
    ...response,
    data,
  }
}
