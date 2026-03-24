export const MOCK_TEAMS = [
  { id: '1', title: 'Equipe A' },
  { id: '2', title: 'Equipe B' },
] as const

export type OpenServiceKey =
  | 'busca_por_placa'
  | 'busca_por_radar'
  | 'cerco_eletronico'
  | 'busca_por_imagem'
  | 'placas_correlatas'
  | 'placas_conjuntas'
  | 'reserva_de_imagem'
  | 'analise_de_imagem'
  | 'outros'
  | null

export type SectionKey =
  | 'info'
  | 'requester'
  | 'services'
  | 'internal'
  | 'comment'
  | 'attachments'

export type DetectionType = 'ANTES' | 'DEPOIS' | 'AMBOS' | null

export type BuscaPorPlacaDraft = {
  period_start: string
  period_end: string
  plate: string
}

export type BuscaPorRadarDraft = {
  period_start: string
  period_end: string
  plate: string
  radar_address: string
}

export type CercoEletronicoDraft = {
  plate: string
  vehicle_observations: string
}

export type BuscaPorImagemDraft = {
  period_start: string
  period_end: string
  plate: string
  address: string
  description: string
}

export type CorrelataDraftItem = {
  period_start: string
  period_end: string
  plate: string
}

export type CorrelataDraft = {
  items: CorrelataDraftItem[]
  interest_interval_minutes: number
  detection_count: number
  detection: DetectionType
}

export type ReservaImagemDraft = {
  period_start: string
  period_end: string
  orientation: string
}

export type AnaliseImagemDraft = {
  period_start: string
  period_end: string
  orientation: string
}

export type OutrosDraft = {
  orientation: string
}

export const SERVICE_CONFIG = {
  busca_por_placa: { label: 'Busca por placa' },
  busca_por_radar: { label: 'Busca por radar' },
  cerco_eletronico: { label: 'Cerco eletrônico' },
  busca_por_imagem: { label: 'Busca por imagem' },
  placas_correlatas: { label: 'Placas correlatas' },
  placas_conjuntas: { label: 'Placas conjuntas' },
  reserva_de_imagem: { label: 'Reserva de imagem' },
  analise_de_imagem: { label: 'Análise de imagem' },
  outros: { label: 'Outros' },
} satisfies Record<Exclude<OpenServiceKey, null>, { label: string }>

export function emptyBuscaPorPlacaDraft(): BuscaPorPlacaDraft {
  return { period_start: '', period_end: '', plate: '' }
}

export function emptyBuscaPorRadarDraft(): BuscaPorRadarDraft {
  return { period_start: '', period_end: '', plate: '', radar_address: '' }
}

export function emptyCercoDraft(): CercoEletronicoDraft {
  return { plate: '', vehicle_observations: '' }
}

export function emptyBuscaPorImagemDraft(): BuscaPorImagemDraft {
  return {
    period_start: '',
    period_end: '',
    plate: '',
    address: '',
    description: '',
  }
}

export function emptyCorrelataItem(): CorrelataDraftItem {
  return { period_start: '', period_end: '', plate: '' }
}

export function emptyCorrelataDraft(): CorrelataDraft {
  return {
    items: [emptyCorrelataItem()],
    interest_interval_minutes: 1,
    detection_count: 10,
    detection: null,
  }
}

export function emptyReservaImagemDraft(): ReservaImagemDraft {
  return { period_start: '', period_end: '', orientation: '' }
}

export function emptyAnaliseImagemDraft(): AnaliseImagemDraft {
  return { period_start: '', period_end: '', orientation: '' }
}

export function emptyOutrosDraft(): OutrosDraft {
  return { orientation: '' }
}
