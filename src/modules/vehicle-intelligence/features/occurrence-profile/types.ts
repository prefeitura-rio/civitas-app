/** Contratos do perfil do RO (`/api/v1/occurrences/...`, `analise/ocorrencia.py`). Os nomes são os da API. */
import type {
  AuthorCitation,
  CloneFields,
  RecentActivityFields,
} from '@/modules/vehicle-intelligence/types/domain'

/** Os sinais próprios de uma placa: citada no relato, compatível com um trecho citado neste RO, Cerco, Disque
 * Denúncia, clone. */
export type SignalReason =
  | 'citada'
  | 'compativel'
  | 'cerco'
  | 'denuncia'
  | 'clone'

export interface OccurrenceSearchResult {
  ro: string
  event_time: string | null
  cisp: string | null
  cisp_name: string | null
  address: string | null
  modality: string | null
  victim_plates: string[]
  matched_by: 'ro' | 'victim_plate'
}

export interface OccurrenceSearchData {
  query: string
  truncated: boolean
  results: OccurrenceSearchResult[]
}

/** Marcas de uma placa: as etiquetas do ranking (`PlateSignals`) e os sinais. */
export interface PlateMarks extends CloneFields, RecentActivityFields {
  plate: string
  is_active_taxi: boolean
  is_bus: boolean
  is_new_plate: boolean
  vehicle_type: string | null
  vehicle_type_share: number | null
  vehicle_type_source: 'PRF' | 'tipoveiculo' | null
  vehicle_color: string | null
  vehicle_model: string | null
  model_year: number | null
  manufacture_year: number | null
  author_citations: AuthorCitation[]
  cited_here: boolean
  in_cerco: boolean
  is_victim_here: boolean
  /** Disque Denúncia: denúncias que citam a placa e a data da última. */
  dd_reports?: number
  dd_last_report?: string | null
  dd_last_subject?: string | null
  signals: SignalReason[]
  /** Os trechos de placa citados neste RO com que a placa é compatível ("final: 5J37"). */
  compatible_with?: string[]
}

/** Uma placa numa das listas (junto ou perto); as colunas que só uma das listas tem são opcionais. */
export interface OccurrencePlateRow extends PlateMarks {
  correlation_strength: number | null
  /** Correlações: em quantos ROs do recorte a placa aparece no grafo, nas janelas da tela (conta este), quantos no dia
   * do RO e em quantos dias. */
  linked_ros: number
  same_day_ros: number
  correlation_days: number
  /** Cobertura (Dias de circulação no grafo): as detecções nos dias com correlação ÷ todas as detecções, em %. */
  coverage: number | null
  coverage_detections: number
  total_detections: number | null
  /** Dias com leitura da placa no período das detecções. */
  days_read: number | null
  first_seen: string | null
  last_seen: string | null
  /** Leituras antes e depois: do fato na lista de perto; da passagem da vítima no mesmo ponto na lista junto. */
  before: number
  after: number
  fact_delta_minutes: number | null
  min_fact_delta_minutes: number | null
  points: string[]
  // Junto (copassagem)
  victims?: string[]
  cooccurrences?: number
  passage_delta_minutes?: number | null
  min_passage_delta_minutes?: number | null
  victim_fact_delta_minutes?: number | null
  places?: string | null
  // Perto
  readings?: number
  avg_fact_distance_meters?: number | null
  min_fact_distance_meters?: number | null
}

export type OccurrencePlateList =
  | {
      available: true
      rows: OccurrencePlateRow[]
      /** Placas que passam nos filtros; `unfiltered_total`, antes deles. */
      total: number
      unfiltered_total: number
      shown: number
      with_signal: number
      cited: number
      compatible: number
      cerco: number
      /** Citadas no Disque Denúncia. */
      reported: number
      clones: number
      /** Perto: de onde vêm as leituras e quantos pontos de coleta há no raio. */
      source?: 'banco' | 'passagens'
      points_in_radius?: number | null
    }
  | { available: false; reason: string }

/** Uma leitura de placa no mapa ou no resumo do dia; `minutes_from_fact` negativo é antes do fato. */
export interface OccurrenceReading {
  time: string
  point: string | null
  place: string | null
  neighborhood: string | null
  latitude: number | null
  longitude: number | null
  minutes_from_fact: number
  distance_meters: number | null
}

/** A placa no dia do fato: sem leitura, só `readings: 0`. */
export interface PlateDay {
  readings: number
  first?: OccurrenceReading
  last?: OccurrenceReading
  closest_in_time?: OccurrenceReading
  closest_in_space?: OccurrenceReading | null
}

export interface OccurrenceFact {
  event_id: string
  victim_plate: string | null
  vehicle_model: string | null
  category: string | null
  victim_role: string | null
  victim_role_confidence: string | null
  recovered_at: string | null
  recovery_cisp_name: string | null
  detections_60min: number | null
  detections_60min_1km: number | null
  status: string | null
  victim_day: PlateDay | null
  victim_passages: OccurrenceReading[]
}

/** Uma placa das listas compatível com um trecho citado: em que listas está e o mais perto que passou do fato. */
export interface CompatiblePlate {
  plate: string
  lists: Array<'together' | 'nearby'>
  min_fact_delta_minutes: number | null
  min_fact_distance_meters: number | null
  first_seen: string | null
  last_seen: string | null
}

/** Placa (ou trecho) citada no relato deste RO, fora do papel de vítima; as marcas vêm só com a placa inteira. */
export interface CitedPlate extends Partial<Omit<PlateMarks, 'plate'>> {
  plate: string | null
  /** O trecho como veio ("final: 5J37"), o tipo, os caracteres e o padrão (nulo: curto demais para cruzar). */
  fragment: string | null
  fragment_kind: 'prefixo' | 'final' | 'fragmento' | 'incerta' | null
  fragment_text: string | null
  pattern: string | null
  /** Trecho: as placas das listas compatíveis (as mais perto no tempo) e quantas são ao todo. */
  matches?: CompatiblePlate[]
  matches_total?: number
  role: string
  confidence: string | null
  source: string | null
  vehicle_status: string | null
  day: PlateDay | null
  in_together: boolean
  in_nearby: boolean
}

export interface OccurrencePoint {
  point: string
  latitude: number
  longitude: number
  place: string | null
  neighborhood: string | null
  distance_meters: number | null
  /** As placas das listas (junto e perto) lidas neste ponto. */
  together: string[]
  nearby: string[]
  /** As citadas no relato, compatíveis com um trecho citado ou no Cerco (a suspeita de clone não marca o ponto). */
  marked: string[]
  victim: boolean
  cited: string[]
}

export interface OccurrenceDetails {
  ro: string
  event_time: string | null
  original_time: string | null
  time_origin: string | null
  time_precision: string | null
  interval_start: string | null
  interval_end: string | null
  modality: string | null
  crime_type: string | null
  category: string | null
  offender_mode: string | null
  cisp: string | null
  cisp_name: string | null
  address: string | null
  neighborhood: string | null
  source_address: string | null
  latitude: number | null
  longitude: number | null
  geocode_quality: string | null
  geocoded_in_panel: boolean
  dynamics: string | null
  summary: string | null
  classification: string | null
  original_offense: string | null
  time_date_divergent: string | null
  linked_cargo_ro: string | null
  /** Banco experimental (ISP): ROs do mesmo lugar e horário viram um fato só; este RO foi agrupado num outro, ou
   * reúne os agrupados nele. */
  episode?: { grouped_into: string | null; grouped: string[] } | null
}

export interface OccurrenceWindowOptions {
  event_windows: number[]
  passage_windows: number[]
  radii: number[]
  near_windows: number[]
  default_event_window?: number
  default_passage_window?: number
  default_radius: number
  default_near_window: number
  /** Filtros de placa: os tipos de veículo do cadastro (os do grafo), os táxis ativos e a atividade recente. */
  vehicle_types: string[]
  active_taxis: { available: boolean; count: number }
  activity: {
    available: boolean
    reference_date: string | null
    windows: number[]
  }
  min_readings: number[]
  /** Detecções da placa em todo o período (a placa lida 1 vez tem cobertura de 100%). */
  min_detections?: number[]
  min_strengths: number[]
  min_links: number[]
  days: DaysBucket[]
  sorts: string[]
}

/** Faixas de dias com leitura no período (quem quase não circula, quem circula sempre). */
export type DaysBucket = 'todos' | 'ate_3' | '4_10' | '11_30' | 'mais_30'

/** Os filtros de placa que a API aplicou (o eco da consulta). */
export interface OccurrenceAppliedFilters {
  vehicle_types: string[]
  taxis: 'todos' | 'somente_taxis' | 'excluir_taxis'
  denuncias: 'todos' | 'somente_citadas' | 'excluir_citadas'
  plate_type: 'todas' | 'clones' | 'tambem_roubadas' | 'comuns'
  when: 'qualquer' | 'antes' | 'antes_e_depois' | 'depois'
  min_readings: number
  min_detections: number
  min_strength: number | null
  activity_days: number | null
  model: string
  min_links: number
  days: DaysBucket
  active: boolean
}

export interface OccurrenceWindows {
  event_window_minutes: number | null
  passage_window_minutes: number | null
  radius_meters: number
  near_window_minutes: number
}

interface OccurrenceProfileBase {
  ro: string
  strategy: 'copassagem' | 'entorno_fato'
  options: OccurrenceWindowOptions
  parameters: OccurrenceWindows
  filters: OccurrenceAppliedFilters
  /** A ordem das listas (feita na API, antes do limite de linhas) e se o sentido foi trocado. */
  sort: string
  sort_inverted: boolean
  detection_period: { start: string | null; end: string | null }
}

export type OccurrenceProfileData =
  | (OccurrenceProfileBase & { found: false; reason: string })
  | (OccurrenceProfileBase & {
      found: true
      occurrence: OccurrenceDetails
      facts: OccurrenceFact[]
      together: OccurrencePlateList | null
      nearby: OccurrencePlateList
      cited: CitedPlate[]
      points: OccurrencePoint[]
      methodology: {
        warning: string
        nearby_note: string
        windows_note: string
        strength: string
        signal: string
      }
    })
