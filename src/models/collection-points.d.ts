export type LprCollectionPoint = {
  id_ponto_coleta: string
  origem_equipamento: string
  codigo_ponto_coleta: string
  local: string
  bairro: string
  sentido: string
  latitude: number
  longitude: number
  status_ativo: string
  datahora_ultima_leitura: string
  total_leituras: number
  ativo_ultimas_24h: boolean
}

export type CollectionPoint = {
  cetRioCode: string
  company: string | null
  latitude: number
  longitude: number
  location: string | null
  district: string | null
  direction: string | null
  statusAtivo?: string
  lastDetectionTime: string | null
  totalDetections?: number
  activeInLast24Hours: boolean
  lane: string | null
}
