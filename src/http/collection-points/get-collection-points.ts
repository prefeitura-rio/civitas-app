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

  const data = filteredData.map((item) => {
    return {
      cetRioCode: item.id_ponto_coleta,
      codigoPontoColeta: item.codigo_ponto_coleta,
      company: item.origem_equipamento || null,
      latitude: item.latitude,
      longitude: item.longitude,
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
