import { api } from '@/lib/api'
import type { BackendRadar, Radar } from '@/models/entities'

export async function getRadars() {
  const response = await api.get<BackendRadar[]>('/radars')

  const data = response.data.map((item) => {
    return {
      district: item.bairro,
      cameraNumber: item.camera_numero,
      cetRioCode: item.codcet,
      latitude: item.latitude,
      longitude: item.longitude,
      location: item.locequip,
      streetName: item.logradouro,
      direction: item.sentido,
    } as Radar
  })
  return {
    ...response,
    data,
  }
}
