import { api } from '@/lib/api'
import type { BackendRadar, Radar } from '@/models/entities'

export async function getRadars() {
  const response = await api.get<BackendRadar[]>('/radars')

  const filteredData = response.data.filter((item) => item.has_data === 'yes')

  const data = filteredData.map((item) => {
    return {
      district: item.bairro,
      cameraNumber: item.camera_numero,
      cetRioCode: item.codcet,
      latitude: item.latitude,
      longitude: item.longitude,
      location: item.locequip,
      streetName: item.logradouro,
      hasData: item.has_data === 'yes',
      company: item.empresa || null,
      activeInLast24Hours: item.active_in_last_24_hours === 'yes',
      lastDetectionTime: item.last_detection_time || null,
      direction: item.sentido || null,
    } as Radar
  })
  return {
    ...response,
    data,
  }
}
