import { api } from '@/lib/api'
import type { CollectionPoint, LprCollectionPoint } from '@/models/entities'

export async function getCollectionPoints() {
  const response = await api.get<LprCollectionPoint[]>(
    '/radars/collection-points',
  )

  const filteredData = response.data.filter(
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
      codigoPontoColeta: item.codigo_ponto_coleta,
      company: item.origem_equipamento || null,
      latitude: lat,
      longitude: lon,
      location: item.local || null,
      district: item.bairro || null,
      direction: item.sentido || null,
      statusAtivo: item.status_ativo,
      lastDetectionTime: item.datahora_ultima_leitura || null,
      totalDetections: item.total_leituras,
      activeInLast24Hours: item.ativo_ultimas_24h,
      lane: null,
    } as CollectionPoint
  })

  return data
}
