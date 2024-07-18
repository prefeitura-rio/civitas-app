import { api } from '@/lib/api'
import type { BackendRadar, Radar } from '@/models/entities'

export async function getRadars() {
  const response = await api.get<BackendRadar[]>('/radars')

  const data = response.data.map((item) => {
    return {
      bairro: item.bairro,
      cameraNumero: item.camera_numero,
      codcet: item.codcet,
      latitude: item.latitude,
      longitude: item.longitude,
      locequip: item.locequip,
      logradouro: item.logradouro,
      sentido: item.sentido,
    } as Radar
  })
  return {
    ...response,
    data,
  }
}
