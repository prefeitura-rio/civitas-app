import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'

/** As duas análises do perfil de placa (abas e rotas `/profile/<placa>/<análise>`). */
export type PlateProfileAnalysis = 'correlations' | 'trends'

/** Transeuntes e veículos: roubo e furto. Carga: só a carga, a carga com o veículo ou só o veículo. */
export type CrimeType =
  | 'ROUBO'
  | 'FURTO'
  | 'CARGA'
  | 'CARGA_VEICULO'
  | 'VEICULO'

/** Delegacia (CISP) com o total de fatos do recorte. */
export interface CispOption {
  codigo: string
  nome: string
  total: number
}

export interface DashboardFilters {
  modalidades: CrimeType[]
  alvos: string[]
  deslocamentos: string[]
  cisps: string[]
}

/** Totais por modalidade: roubo e furto (transeuntes, veículos) ou categorias da carga. */
export type ModalityCounts = Partial<
  Record<'roubos' | 'furtos' | 'veiculo_carga' | 'carga' | 'veiculo', number>
>

export interface CispProperties extends ModalityCounts {
  cisp: string
  nome: string
  ocorrencias: number
  posicao: number
  participacao: number
  intensidade: number
  selected: boolean
}

export interface DistributionItem {
  categoria: string
  ocorrencias: number
  percentual: number
  selected?: boolean
}

export interface DashboardPoint {
  id: string
  data_hora: string | null
  data_fato?: string | null
  origem_horario?: string | null
  intervalo_inicio?: string | null
  intervalo_fim?: string | null
  placas_autores_citadas?: string | null
  placas_autores_parciais?: string | null
  fora_area_cisps?: boolean
  modalidade: CrimeType
  tipo: string
  alvo: string
  deslocamento: string
  cisp: string
  endereco: string | null
  bairro: string | null
  latitude: number
  longitude: number
}

export interface DashboardData {
  summary: ModalityCounts & {
    total: number
    cisps_selecionadas: number
    cisp_lider: string | null
    cisp_lider_total: number
    /** Transeuntes: área foco e fatos com autor de moto ou carro. */
    area?: string | null
    motorizadas?: number
  }
  crimes: Array<{ tipo: CrimeType; ocorrencias: number; selected: boolean }>
  alvos: DistributionItem[]
  deslocamentos?: DistributionItem[]
  tipos?: DistributionItem[]
  serie_mensal: Array<{ mes: string; ocorrencias: number }>
  ranking: Array<
    ModalityCounts & {
      cisp: string
      area: string
      ocorrencias: number
      posicao: number
    }
  >
  mapa: FeatureCollection<Polygon | MultiPolygon, CispProperties>
  /** Transeuntes: fatos georreferenciados da área foco. */
  pontos?: DashboardPoint[]
  metadata: {
    data_mode: 'detailed' | 'aggregated'
    periodo_inicio: string
    periodo_fim: string
    ultimo_mes_parcial: boolean
    filtros_exatos: string[]
    observacoes: string[]
    qualidade?: Record<string, number> | null
  }
}

/** Opções do grafo; janelas e raios são as políticas materializadas no banco. */
export interface MasterGraphOptions {
  modalidades: CrimeType[]
  alvos: string[]
  deslocamentos?: string[]
  veiculos?: string[]
  cisps: string[]
  cisp_names: Record<string, string>
  area_name?: string | null
  active_taxis: { available: boolean; count: number }
  available_event_window_minutes: number[]
  available_radius_meters?: number[]
  available_passage_window_minutes?: number[]
  fact_period?: { start: string | null; end: string | null }
  available_period_months?: number[]
  cargo?: { available: boolean; events: number; occurrences: number }
}

export type PlateTypeFilter = 'todas' | 'clones' | 'comuns' | 'tambem_roubadas'

/** RO cuja dinâmica cita a placa como veículo dos autores (carga). */
export interface AuthorCitation {
  ro: string
  confidence?: string | null
  source?: string | null
}
export type TaxiFilter = 'todos' | 'somente_taxis' | 'excluir_taxis'
/** Placas citadas no Disque Denúncia (`placas.denuncias`). */
export type DenunciaFilter = 'todos' | 'somente_citadas' | 'excluir_citadas'

export interface ActivityFilterInfo {
  available: boolean
  reference_date: string | null
  days: number
  applied: boolean
  available_windows?: number[]
}

export interface PlateProfileLocation {
  point_id: string
  camera: string
  location: string
  neighborhood: string
  direction: string
  detections: number
  latitude: number
  longitude: number
  daily?: Array<{ day: string; count: number }>
  weekday_hour_heatmap?: number[][]
  by_shift?: { madrugada: number; manha: number; tarde: number; noite: number }
}

export interface PlateProfileNeighborhood {
  name: string
  detections: number
  share: number
  points: number
}

export type RioNeighborhoodGeometry = FeatureCollection<
  Polygon | MultiPolygon,
  {
    nome: string
    codbairro: string
    regiao_adm: string
    area_plane: string
  }
> & {
  source?: string
  attribution?: string
}

/** Hora típica por média circular; `reliable` é falso quando os horários estão
 *  espalhados demais pelo dia para a média significar alguma coisa. */
export interface TypicalHour {
  hour: number | null
  label: string | null
  shift: 'madrugada' | 'manha' | 'tarde' | 'noite' | null
  concentration: number
  reliable: boolean
}

export interface HiatoLocation {
  location: string
  point_id: string
  latitude: number
  longitude: number
  hiatos: number
  median_gap_seconds: number
  /** Presente em `before`: hora típica em que a circulação para. */
  stop_hour?: TypicalHour
  /** Presente em `after`: hora típica em que a circulação retoma. */
  resume_hour?: TypicalHour
}

export interface HiatoPair {
  origin_location: string
  dest_location: string
  hiatos: number
  median_gap_seconds: number
  stop_hour?: TypicalHour
  resume_hour?: TypicalHour
}

export interface PlateHiatos {
  count: number
  min_hours: number
  before: HiatoLocation[]
  after: HiatoLocation[]
  pairs: HiatoPair[]
  overall: {
    stop_hour: TypicalHour
    resume_hour: TypicalHour
    median_gap_seconds: number | null
  }
}

export interface PlateProfileTripLeg {
  origin_point_id: string
  dest_point_id: string
  origin_location: string
  dest_location: string
  origin_neighborhood: string | null
  dest_neighborhood: string | null
  origin_latitude: number
  origin_longitude: number
  dest_latitude: number
  dest_longitude: number
  count: number
  median_gap_seconds: number
}

/** Fato ligado à placa. Copassagem também traz os fatos em que ela é a vítima. */
export interface PlateProfileOccurrence {
  event_id: string
  role: 'victim' | 'candidate'
  event_time: string
  day: string
  cisp: string
  modality: CrimeType
  target_category: string
  event_latitude: number | null
  event_longitude: number | null
  event_address: string | null
  geocode_quality: string | null
  fact_distance_meters?: number | null
  /** Entorno do fato. */
  offender_mode?: string
  crime_type?: string | null
  ro?: string | null
  fact_delta_minutes?: number | null
  before_count?: number
  after_count?: number
  /** Copassagem: placa vítima do fato e tempo do fato até a passagem da correlata. */
  victim_plate?: string
  vehicle_model?: string
  candidate_event_delta_minutes?: number | null
  /** Carga: classificação do RO e papel da placa nele. */
  classificacao?: string
  papel_placa?: string
  confianca_papel?: string
  precisao_horario?: string
  horario_data_divergente?: string
  delito_original?: string
}

export interface PlateProfileData {
  ready: boolean
  reason?: string
  missing_source?: string
  build_command?: string
  plate: string
  period: { start: string | null; end: string | null }
  /** Copassagem: a placa também consta como vítima no recorte. */
  is_victim_plate?: boolean
  vehicle: {
    vehicle_type: string | null
    vehicle_type_share?: number | null
    vehicle_type_source?: 'PRF' | 'tipoveiculo' | null
    vehicle_color?: string | null
    vehicle_model?: string | null
    model_year?: number | null
    manufacture_year?: number | null
    target_category?: string | null
  }
  summary: {
    total_detections: number
    active_days: number
    avg_detections_active_day: number
    top_location: string | null
    top_location_point_id: string | null
    top_location_detections: number
    top_location_share: number
    top_neighborhood: string | null
    top_neighborhood_detections: number
    top_neighborhood_share: number
    predominant_shift: 'madrugada' | 'manha' | 'tarde' | 'noite' | null
    predominant_shift_detections: number
    predominant_shift_share: number
    peak_day: string | null
    peak_day_detections: number
    top_weekday: number | null
    top_weekday_detections: number
    top_weekday_share: number
  }
  top_locations: PlateProfileLocation[]
  /** Todos os pontos de coleta da placa (o mapa os agrupa em cluster). */
  map_points: PlateProfileLocation[]
  neighborhoods: PlateProfileNeighborhood[]
  weekday_hour_heatmap: number[][]
  weekday_totals: number[]
  shift_totals: {
    madrugada: number
    manha: number
    tarde: number
    noite: number
  }
  shift_profiles: Record<
    'madrugada' | 'manha' | 'tarde' | 'noite',
    { neighborhood: string | null; location: string | null }
  >
  daily_series: Array<{ day: string; detections: number }>
  trip_legs: PlateProfileTripLeg[]
  hiatos: PlateHiatos
  occurrences: PlateProfileOccurrence[]
  occurrence_days: string[]
  methodology: Record<string, unknown>
}

export interface PlateCorrelationEvent {
  event_id: string
  ro: string | null
  crime_type: string | null
  event_time: string
  cisp: string
  modality: CrimeType
  target_category: string | null
  offender_mode: string | null
  address: string | null
  neighborhood: string | null
  cooccurrences: number
  point_count: number
  avg_fact_delta_minutes: number
  min_fact_delta_minutes: number
  min_fact_distance_meters: number | null
  before_count: number
  after_count: number
  correlation_strength: number | null
  first_seen: string
  last_seen: string
  points: string[]
}

export type PlateCitationStatus =
  | 'correlated'
  | 'correlated_wider'
  | 'approximate_match'
  | 'no_time'
  | 'never_read'
  | 'not_read_that_day'
  | 'read_outside'
export interface PlateCitationReading {
  detected_at: string
  delta_minutes: number | null
  distance_meters: number | null
  location: string | null
  point_id: string | null
}
export interface PlateCitation {
  event_id: string
  event_time: string | null
  event_date: string | null
  cisp: string | null
  modality: string | null
  target_category: string | null
  offender_mode: string | null
  crime_type: string | null
  address: string | null
  neighborhood: string | null
  latitude: number | null
  longitude: number | null
  note: string
  status: PlateCitationStatus
  correlation: {
    cooccurrences: number
    min_delta_minutes: number | null
    min_distance_meters: number | null
  } | null
  wider_correlation: {
    event_window_minutes: number
    radius_meters: number
    min_delta_minutes: number | null
    min_distance_meters: number | null
  } | null
  total_readings: number
  same_day_readings: number
  approximate_matches: number
  nearest_in_time: PlateCitationReading | null
  nearest_in_space: PlateCitationReading | null
  approximate_hour: { start: string; end: string; origin: string } | null
  approximate_best: PlateCitationReading | null
  before_period: boolean
}
export interface PlateCitationsData {
  ready: boolean
  reason?: string
  plate: string
  citations: PlateCitation[]
  methodology: {
    event_window_minutes: number
    radius_meters: number
    period_start: string | null
    rule: string
    warning: string
  }
}

/** Números de uma placa num recorte, os do perfil aberto sem filtros (`/api/placas/busca`). */
export interface PlateSearchCounts {
  /** Fatos em que a placa é correlata no grafo inteiro: a maior janela, sem filtros. */
  fatos: number
  /** Os mesmos na janela do perfil com "Ver todos os fatos" (menor que a maior em carga). */
  fatos_perfil: number
  /** Fatos em que a placa é a vítima (copassagem). */
  vitima: number
  /** ROs que citam a placa no relato como veículo dos autores. */
  citada: number
  /** Dias com leitura no período do recorte. */
  dias: number
  leituras: number
}

export interface PlateSearchWindow {
  janela_min: number
  raio_m?: number
  passagem_min?: number
}

/** Placa achada pela busca nos três recortes; `sinais` são as etiquetas do ranking, iguais em todo recorte. */
export interface PlateSearchItem {
  placa: string
  sinais: CloneFields &
    RecentActivityFields & {
      is_active_taxi: boolean
      is_bus?: boolean
      vehicle_type?: string | null
      vehicle_type_share?: number | null
      vehicle_type_source?: 'PRF' | 'tipoveiculo' | null
      vehicle_color?: string | null
      vehicle_model?: string | null
      model_year?: number | null
      manufacture_year?: number | null
    }
  /** Frota municipal: fora das leituras e das correlatas nos três recortes. */
  onibus_municipal: boolean
  /** Motivo, quando a placa é um erro de leitura apontado (`placas_invalidas.csv`). */
  invalida: string | null
  recortes: Record<string, PlateSearchCounts>
}

export interface PlateSearchData {
  padrao: string
  exata: boolean
  total: number
  limite: number
  /** Janelas de cada recorte: a maior (grafo inteiro) e a do perfil sem filtros. */
  criterios: Record<
    string,
    {
      estrategia: 'entorno_fato' | 'copassagem'
      grafo: PlateSearchWindow
      perfil: PlateSearchWindow
    }
  >
  placas: PlateSearchItem[]
}

/** Placa vítima ligada à correlata (copassagem). */
export interface PlateCorrelationVictim {
  victim_plate: string
  events: number
  cooccurrences: number
  cisp_count: number
  cisps: string[]
  ros: string[]
  modalities: string[]
  target_category: string
  avg_candidate_event_delta_minutes: number
  min_fact_distance_meters: number | null
  first_seen: string
  last_seen: string
}

export interface PlateCorrelationsData {
  ready: boolean
  reason?: string
  plate: string
  summary: {
    linked_events: number
    cisp_count: number
    distinct_days: number
    cooccurrences: number
    avg_fact_distance_meters: number
    min_fact_distance_meters: number
    median_fact_distance_meters: number
    first_seen: string
    last_seen: string
    vehicle_type: string | null
    vehicle_type_share?: number | null
    vehicle_type_source?: 'PRF' | 'tipoveiculo' | null
    vehicle_color?: string | null
    vehicle_model?: string | null
    model_year?: number | null
    manufacture_year?: number | null
    temporal_proximity: number
    space_time_temperature: number
    correlation_strength: number | null
    /** Entorno do fato: leituras no raio e na janela. */
    median_fact_delta_minutes?: number
    avg_fact_delta_minutes?: number
    min_fact_delta_minutes?: number
    before_count?: number
    after_count?: number
    /** Copassagem: passagens junto à placa vítima. */
    victims?: number
    median_passage_delta_minutes?: number
    avg_candidate_event_delta_minutes?: number
    min_candidate_event_delta_minutes?: number
    is_new_plate?: boolean
  }
  is_clone_suspect: boolean
  is_clone_confirmed: boolean
  is_active_taxi?: boolean
  clone: {
    is_clone_confirmed: boolean
    clone_days?: number | null
    clone_total_pairs?: number | null
    clone_temperature_score?: number | null
    clone_temperature?: string | null
  }
  events?: PlateCorrelationEvent[]
  victims?: PlateCorrelationVictim[]
  cisps: Array<{
    cisp: string
    events: number
    victims?: number
    cooccurrences: number
  }>
  cisp_names: Record<string, string>
  occurrences: PlateProfileOccurrence[]
  methodology: Record<string, unknown>
}

export interface Insight {
  title: string
  text: string
}

export interface CloneFields {
  is_clone_suspect: boolean
  is_clone_confirmed: boolean
  clone_days: number | null
  clone_total_pairs: number | null
  clone_ocr_score: number | null
  clone_route_score: number | null
  clone_temperature_score: number | null
  clone_temperature: string | null
}

export interface RecentActivityFields {
  activity_reference_date: string | null
  recent_activity_last_seen: string | null
  detections_7d: number
  detections_15d: number
  detections_30d: number
  detections_45d: number
}

/** Placa correlata no grafo. Os campos `fact_*` são do entorno do fato; os de passagem, da copassagem. */
export interface PreEventCandidate extends CloneFields, RecentActivityFields {
  plate: string
  score: number
  confidence: 'alta' | 'média' | 'baixa'
  linked_events: number
  distinct_days: number
  cisp_count: number
  cisps: string[]
  cooccurrences: number
  points: number
  avg_fact_delta_minutes?: number
  median_fact_delta_minutes?: number
  min_fact_delta_minutes?: number
  close_fact_events_3m?: number
  close_fact_events_5m?: number
  avg_fact_distance_meters?: number | null
  median_fact_distance_meters: number | null
  min_fact_distance_meters: number | null
  temporal_proximity: number
  geographic_proximity: number | null
  space_time_temperature: number | null
  correlation_strength: number | null
  average_correlation_strength?: number | null
  vehicle_type: string | null
  vehicle_type_share?: number | null
  vehicle_type_source?: 'PRF' | 'tipoveiculo' | null
  vehicle_color?: string | null
  vehicle_model?: string | null
  model_year?: number | null
  manufacture_year?: number | null
  event_profiles?: string[]
  offender_modes?: string[]
  before: number
  after: number
  first_seen: string
  last_seen: string
  same_day_linked_events: number
  same_day_cisp_count: number
  cluster_date: string | null
  cluster_span_minutes: number | null
  is_active_taxi: boolean
  is_bus?: boolean
  victims_linked?: number
  is_new_plate?: boolean
  author_citations?: AuthorCitation[]
  median_passage_delta_minutes?: number
  close_passage_events_3m?: number
  close_passage_events_5m?: number
  avg_candidate_event_delta_minutes?: number
  min_candidate_event_delta_minutes?: number
}

export interface MasterPreData {
  ready: boolean
  reason?: string
  missing_source?: string
  build_command?: string
  summary: {
    events: number
    candidates: number
    displayed_candidates: number
    cisps: number
    cooccurrences: number
    cross_cisp_candidates: number
    clone_suspect_candidates: number
    recurrent_candidates?: number
    victims?: number
    displayed_victims?: number
    displayed_events?: number
  }
  candidates: PreEventCandidate[]
  authorship_plate_citations?: Array<{ plate: string; note: string }>
  graph: {
    total_events?: number
    total_edges?: number
    /** Âncora: o fato (`event`, entorno) ou a placa vítima (`victim`, copassagem). */
    nodes: Array<{
      id: string
      label: string
      kind: 'event' | 'victim' | 'candidate'
      score?: number
      detail?: string
      author_citations?: AuthorCitation[]
      ro?: string | null
      crime?: string | null
      occurred_at?: string | null
      address?: string | null
      author_mode?: string | null
      timing?: string | null
      linked_plates?: number | null
      reading_count?: number | null
      high_strength_count?: number | null
      hidden_plates?: number | null
    }>
    edges: Array<{
      source: string
      target: string
      weight: number
      events?: number
      event_ids?: string[]
      cisps?: string
      temporal_proximity: number
      avg_fact_distance_meters: number | null
      min_fact_distance_meters: number | null
      geographic_proximity: number | null
      space_time_temperature: number | null
      correlation_strength: number | null
      avg_fact_delta_minutes?: number
      min_fact_delta_minutes?: number
      before?: number
      after?: number
      median_passage_delta_minutes?: number
      close_passage_events_3m?: number
      close_passage_events_5m?: number
      avg_candidate_event_delta_minutes?: number
      median_fact_distance_meters?: number | null
    }>
  }
  specialization: Array<{
    category: string
    events: number
    candidates: number
  }>
  patterns: Array<
    CloneFields &
      RecentActivityFields & {
        plate: string
        event_date: string
        linked_events: number
        cisp_count: number
        cisps: string[]
        span_minutes: number
        is_active_taxi: boolean
      }
  >
  insights: Insight[]
  activity?: ActivityFilterInfo
  methodology: Record<string, string | number | number[]>
}

export type CorrelationRankingView =
  | 'correlations'
  | 'distinct_days'
  | 'same_day'
  | 'near_fact'
  | 'cold_plate'
  | 'quiet_event'
  | 'quiet_victim'
  | 'stolen_before_recovery'
export type CorrelationRankingSort =
  | 'correlations'
  | 'distinct_days'
  | 'linked_events'
  | 'cisp_count'
  | 'space_time_proximity'
  | 'correlation_strength'
  | 'average_correlation_strength'
  | 'avg_fact_delta_minutes'
  | 'median_fact_delta_minutes'
  | 'close_fact_events_3m'
  | 'close_fact_events_5m'
  | 'min_fact_distance_meters'
  | 'before_count'
  | 'after_count'
  | 'coverage'
  | 'circulation_days'
  | 'max_same_day_correlations'
  | 'span_minutes'
  | 'event_date'
  | 'victim_plates'
  | 'avg_fact_candidate_minutes'
  | 'median_passage_delta_minutes'
  | 'close_passage_events_3m'
  | 'close_passage_events_5m'
  | 'stolen_at'
  | 'recovered_on'
export type SortDirection = 'asc' | 'desc'
/** Ordenação aplicada, da coluna mais forte para a mais fraca. */
export type CorrelationRankingSortTerm = {
  key: CorrelationRankingSort
  direction: SortDirection
}

export interface CorrelationRankingRow
  extends CloneFields,
    RecentActivityFields {
  plate: string
  vehicle_type?: string | null
  vehicle_type_share?: number | null
  vehicle_type_source?: 'PRF' | 'tipoveiculo' | null
  vehicle_color?: string | null
  vehicle_model?: string | null
  model_year?: number | null
  manufacture_year?: number | null
  /** CISP onde a placa é mais lida (todas as leituras até a referência, igual em qualquer recorte) e a parcela nela. */
  main_cisp?: string | null
  main_cisp_name?: string | null
  main_cisp_share?: number | null
  main_cisp_detections?: number | null
  /** Disque Denúncia: denúncias que citam a placa com "PLACA" antes (`pipeline.denuncias`) e a data da última. */
  dd_reports?: number
  dd_last_report?: string | null
  /** O assunto (tipo) da última denúncia: mostra quando é queixa de ônibus ou veículo abandonado, não crime. */
  dd_last_subject?: string | null
  linked_events: number
  correlations: number
  distinct_days?: number
  cisp_count: number
  cisps: string[]
  offender_modes?: string[]
  event_ids?: string[]
  /** Sequências em um só dia: totais da placa no período (os mínimos da tela valem sobre eles). */
  plate_linked_events?: number
  plate_victim_plates?: number
  median_fact_delta_minutes?: number
  avg_fact_delta_minutes?: number
  close_fact_events_3m?: number
  close_fact_events_5m?: number
  avg_fact_distance_meters?: number
  median_fact_distance_meters?: number
  min_fact_distance_meters?: number
  before_count?: number
  after_count?: number
  space_time_proximity?: number
  correlation_strength?: number | null
  average_correlation_strength?: number | null
  circulation_days?: number | null
  coverage?: number | null
  total_detections?: number | null
  coverage_detections?: number | null
  max_same_day_correlations?: number
  event_correlata_min?: number | null
  first_seen: string
  last_seen: string
  is_active_taxi: boolean
  is_bus?: boolean
  event_date?: string
  span_minutes?: number
  victim_plates?: number
  median_passage_delta_minutes?: number
  close_passage_events_3m?: number
  close_passage_events_5m?: number
  avg_fact_candidate_minutes?: number
  is_new_plate?: boolean
  author_citations?: AuthorCitation[]
  stolen_event_id?: string
  stolen_at?: string
  recovered_on?: string
  recovery_cisp?: string
}

export interface CorrelationRankingData {
  ready: boolean
  view: CorrelationRankingView
  rows: CorrelationRankingRow[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
  methodology: string
  activity?: ActivityFilterInfo
  analysis?: {
    window_minutes: number
    available_window_minutes: number[]
    radius_meters: number | null
    available_radius_meters?: number[]
    passage_window_minutes?: number
  }
}

export interface TimelineDetection {
  event_id: string
  role: 'victim' | 'candidate'
  detected_at: string
  point_id: string
  camera: string
  latitude: number
  longitude: number
  location: string
  neighborhood: string
  direction: string
  fact_offset_minutes?: number | null
  fact_distance_meters?: number | null
  within_fact_window: boolean
  correlated: boolean
  candidate_trail: 'suspect_1' | 'suspect_2' | null
  candidate_trail_kind: 'anchor' | 'aggregated' | null
}

export interface TimelineCamera {
  point_id: string
  latitude: number | null
  longitude: number | null
  location: string | null
  neighborhood: string | null
  distance_meters: number | null
}

/** Um fato do dia na timeline: a âncora é o RO (entorno) ou a placa vítima (copassagem). */
export interface TimelineCase {
  event_id: string
  ro?: string | null
  candidate_plate: string
  event_time: string
  correlations: number
  fact_window_start: string
  fact_window_end: string
  day: string
  modality: CrimeType
  target_category: string
  event_latitude: number | null
  event_longitude: number | null
  event_address: string | null
  geocode_quality: string | null
  detections: TimelineDetection[]
  /** Entorno do fato. */
  event_cisp?: string
  offender_mode?: string | null
  crime_type?: string | null
  event_neighborhood?: string | null
  min_fact_delta_minutes?: number | null
  min_fact_distance_meters?: number | null
  cameras?: TimelineCamera[]
  /** Copassagem. */
  victim_plate?: string
  victim_cisp?: string
  vehicle_model?: string
  candidate_author_citations?: AuthorCitation[]
  /** Timeline do grupo: as placas do grupo no RO, os pares com evidência e as partidas e desconexões ligadas a ele. */
  group?: {
    plates: string[]
    pairs: Array<{
      a: string
      b: string
      together: boolean
      disconnected: boolean
    }>
    departures: GroupMarkPoint[]
    disconnections: GroupMarkPoint[]
  }
}

/** Timeline do grupo: outra placa do grupo no mesmo equipamento, até 3 min da leitura. */
export interface GroupTogetherPassage {
  plate: string
  detected_at: string
  seconds: number
  /** A leitura está a até 1 h de um fato do grupo. */
  near_fact: boolean
  /** ROs em que a passagem conta como "juntas no fato": as duas placas no RO, a ±1 h dele. */
  evidence_events: string[]
}

/** Partida (primeira leitura do dia do fato) ou desconexão (último local antes de 8 h sem leitura) de uma placa num RO. */
export interface GroupDetectionMark {
  kind: 'departure' | 'disconnection'
  event_id: string
  /** Desconexão: horas do fato até esta leitura. */
  elapsed_hours: number | null
  /** Desconexão: horas sem leitura depois dela, até a próxima leitura da placa (nulo: nenhuma até o fim das passagens). */
  gap_hours: number | null
  next_at: string | null
  complex: string | null
  faction: string | null
  distance_meters: number | null
}

export interface GroupMarkPoint extends GroupDetectionMark {
  plate: string
  at: string
  latitude: number
  longitude: number
  location: string | null
  neighborhood: string | null
}

export interface CorrelatedPlateTimelineData {
  ready: boolean
  plate: string
  summary: { days: number; events: number }
  /** Ausente quando a placa não tem fatos no recorte. */
  methodology?: {
    day_window_hours: number
    day_margin_minutes?: number
    fact_window_minutes: number
    radius_meters?: number
    passage_window_minutes?: number
  }
  cases: TimelineCase[]
  /** Carga: ROs que citam a placa como veículo dos autores. */
  author_citations?: AuthorCitation[]
}

/** Uma denúncia do Disque Denúncia que cita a placa (`/api/placas/<placa>/denuncias`, `analise/denuncias.py`). */
export interface PlateDenuncia {
  id: string
  number: string | null
  reported_at: string | null
  diffused_at: string | null
  status: string | null
  address: string | null
  neighborhood: string | null
  subneighborhood: string | null
  reference: string | null
  latitude: number | null
  longitude: number | null
  subject_class: string | null
  subject: string | null
  subjects: string[]
  involved: Array<{ nome: string | null; vulgo: string | null }>
  report: string | null
  /** Onde a placa aparece no relato, como foi escrita. */
  mention: string
  mention_start: number
  mention_end: number
  corrected: boolean
}

export interface PlateDenunciasData {
  plate: string
  available: boolean
  reports: PlateDenuncia[]
  warning: string
}
