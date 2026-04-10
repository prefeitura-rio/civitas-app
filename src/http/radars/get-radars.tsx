import { api } from '@/lib/api'
import type { BackendRadar, Radar } from '@/models/entities'

export async function getRadars() {
  const response = await api.get<BackendRadar[]>('/radars')

  const filteredData = response.data
    .filter((item) => item.has_data)
    .filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => t.id_ponto_coleta === item.id_ponto_coleta),
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

    return {
      cetRioCode: item.id_ponto_coleta,
      company: item.origem_equipamento || null,
      latitude: lat,
      longitude: lon,
      location: item.local_ponto_coleta,
      district: item.bairro,
      direction: item.sentido || null,
      hasData: item.has_data,
      activeInLast24Hours: item.active_in_last_24_hours,
      lastDetectionTime: item.last_detection_time || null,
    } as Radar
  })

  return data
}
