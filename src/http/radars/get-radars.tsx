import { api } from '@/lib/api'
import type { BackendRadar, Radar } from '@/models/entities'

export async function getRadars() {
  const response = await api.get<BackendRadar[]>('/radars')

  // First filter for has_data, then remove duplicates by codcet
  const filteredData = response.data
    .filter((item) => item.has_data === 'yes')
    .filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.codcet === item.codcet),
    )

  const clusters: { [key: string]: number } = {}

  const data = filteredData.map((item) => {
    const key = `${Math.floor(item.longitude * 10000)},${Math.floor(item.latitude * 10000)}`
    let lat = 0
    let lon = 0

    if (!clusters[key]) {
      lon = item.longitude
      lat = item.latitude
      clusters[key] = 1
    } else {
      lon = item.longitude + 0.00001 * clusters[key]
      lat = item.latitude - 0.00001 * clusters[key]
      clusters[key] += 1
    }

    const laneRegex = /- FX (\d+)/

    const laneMatch = item.locequip?.match(laneRegex)
    const lane = laneMatch ? laneMatch[1] : null

    return {
      district: item.bairro,
      cameraNumber: item.camera_numero,
      cetRioCode: item.codcet,
      latitude: lat,
      longitude: lon,
      location: item.locequip,
      streetName: item.logradouro,
      hasData: item.has_data === 'yes',
      company: item.empresa || null,
      activeInLast24Hours: item.active_in_last_24_hours === 'yes',
      lastDetectionTime: item.last_detection_time || null,
      direction: item.sentido || null,
      lane,
    } as Radar
  })

  return data
}
