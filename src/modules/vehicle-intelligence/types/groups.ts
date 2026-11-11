/** Contrato de `/api/<recorte>/v1/groups`, `/groups/profile` e `/groups/timeline` (motor `analise/grupos.py`). */
import type {
  GroupDetectionMark,
  GroupMarkPoint,
  GroupTogetherPassage,
} from '@/modules/vehicle-intelligence/types/domain'

export interface GroupMember {
  plate: string
  seed: boolean
  coverage_rank: number | null
  cited: boolean
  linked_events: number | null
  correlations: number | null
  distinct_days: number | null
  coverage: number | null
  circulation_days: number | null
  max_same_day_correlations: number | null
  correlation_strength: number | null
  first_seen: string | null
  last_seen: string | null
  vehicle_type: string | null
  vehicle_model: string | null
  vehicle_color: string | null
  manufacture_year: number | null
  model_year: number | null
  is_active_taxi: boolean | null
  is_clone_suspect: boolean | null
  is_clone_confirmed: boolean | null
  is_bus: boolean | null
  recent_activity_last_seen: string | null
  detections_7d: number | null
  detections_15d: number | null
  detections_30d: number | null
  detections_45d: number | null
}

export interface GroupEdge {
  a: string
  b: string
  shared_events: number
  chance: number | null
  together_at_fact: number
  disconnected_together: number
  days_together: number
  days_together_outside_facts: number
  strong: boolean
  double_read: boolean
  routine: boolean
}

export interface TerritoryItem {
  complex: string
  faction: string | null
  count: number
  total: number
  lift: number
}
export interface Territory {
  departure: TerritoryItem[]
  disconnection: TerritoryItem[]
}

export interface Group {
  id: string
  label: string
  members: GroupMember[]
  edges: GroupEdge[]
  events: number
  shared_events: number
  /** ROs do grupo por tipo do fato (ROUBO, FURTO; as categorias de carga), com os filtros da tela. */
  modalities?: Record<string, number>
  strength: number
  seeds: number
  territory: Territory
  cell: string | null
}

export interface CellSeed {
  plate: string
  group: string | null
  evidence: Array<{
    kind: 'departure' | 'disconnection'
    count: number
    total: number
    lift: number
  }>
  member: GroupMember
}

export interface TerritorialCell {
  complex: string
  faction: string | null
  seeds: CellSeed[]
  groups: string[]
  solo: string[]
}

export type Methodology = Record<string, string>

export interface GroupsData {
  ready: boolean
  reason?: string
  build_command?: string | null
  parameters?: {
    seeds: number
    minimum_seed_events: number
    minimum_partner_events: number
    criterion: string
    window_minutes: number
    radius_meters: number | null
    passage_window_minutes?: number | null
    link_rule?: 'comboio' | 'ros'
    minimum_shared_events?: number | null
    evidence_build: string
    evidence_created_at: string
  }
  summary?: {
    seeds: number
    seeds_in_groups: number
    groups: number
    members: number
    strong_links: number
    cells: number
    universe: number
  }
  groups: Group[]
  cells: TerritorialCell[]
  methodology?: Methodology
}

export interface GroupEvent {
  event_id: string
  ro: string | null
  occurred_at: string
  day: string
  hour: number
  weekday: number
  cisp: string | null
  cisp_name: string | null
  modality: string | null
  category: string | null
  crime_type: string | null
  offender_mode: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  plates: string[]
  min_distance_meters: number | null
  min_delta_minutes: number | null
  pairs: Array<{
    a: string
    b: string
    together: boolean
    disconnected: boolean
  }>
}

export type PointKind = 'departure' | 'passage' | 'disconnection'

/** Partida, passagem junta (2+ placas do grupo na mesma câmera perto do fato) ou desconexão de uma placa num RO. */
export interface GroupPoint {
  plate: string
  event_id: string
  kind: PointKind
  /** Local de leitura (câmeras na mesma coordenada viram um só): agrupa os polos do mapa. */
  camera_id: string | null
  latitude: number
  longitude: number
  location: string | null
  neighborhood: string | null
  at: string | null
  territory: string | null
  complex: string | null
  faction: string | null
  distance_meters: number | null
  elapsed_hours: number | null
}

/** Uma placa na série de começos e fins (`analise/atividade.py`). */
export interface ActivityPlate {
  plate: string
  /** Dias com leitura por semana (segunda-feira da semana → dias). */
  weeks: Record<string, number>
  first: string
  last: string
  days: number
  /** Começou a ser lida dentro do período (longe da borda do histórico, com dias lidos suficientes). */
  started: boolean
  /** Parou de ser lida dentro do período. */
  stopped: boolean
}

/** Possível troca de moto (`analise/atividade.trocas`): `from` parou de ser lida e `to` começou logo depois. No grupo, `to`
 * costuma ser de fora dele e só entram as parecidas; `cited_to` diz se ela foi citada no relato. */
export interface Succession {
  from: string
  to: string
  last_read: string
  first_read: string
  gap_days: number
  /** Semelhança de rotina (últimas 8 semanas de `from` × primeiras 8 de `to`, descontadas as rotinas genéricas); nula sem a camada. */
  routine_similarity: number | null
  similar: boolean
  cited_to?: boolean
}

export interface ActivitySeries {
  plates: ActivityPlate[]
  first_day: string
  last_day: string
  minimum_days: number
  margin_days: number
}

export interface GroupProfileData {
  ready: boolean
  reason?: string
  build_command?: string | null
  id?: string
  members: GroupMember[]
  edges: GroupEdge[]
  events: GroupEvent[]
  points: GroupPoint[]
  territory?: Territory
  calendar: Array<{ day: string; plates: string[]; events: number }>
  trends?: {
    hours: number[]
    weekdays: number[]
    cisps: Array<{ cisp: string; name: string | null; events: number }>
    categories: Array<{ value: string; events: number }>
    modalities: Array<{ value: string; events: number }>
  }
  activity?: ActivitySeries | null
  successions?: Succession[]
  parameters?: {
    window_minutes: number
    radius_meters: number | null
    passage_window_minutes?: number | null
    criterion: string
  }
  methodology?: Methodology
}

/** Uma leitura de placa do grupo num dia com RO (`/groups/timeline`). */
export interface GroupTimelineDetection {
  plate: string
  detected_at: string
  point_id: string
  camera: string
  latitude: number
  longitude: number
  location: string
  neighborhood: string
  direction: string
  /** Até a janela (10 min) de um fato do grupo. */
  within_fact_window: boolean
  /** Num equipamento do raio de um RO da placa, dentro da janela. */
  correlated: boolean
  matches: Array<{
    event_id: string
    distance_meters: number | null
    offset_minutes: number
  }>
  together: GroupTogetherPassage[]
  /** A passagem junta (mesmo equipamento, até 3 min, em cadeia) a que a leitura pertence. */
  together_id: string | null
  marks: GroupDetectionMark[]
}

export interface GroupTimelineEvent extends GroupEvent {
  neighborhood: string | null
  geocode_quality: string | null
  departures: GroupMarkPoint[]
  disconnections: GroupMarkPoint[]
}

export interface GroupTimelineDay {
  day: string
  events: number
  plates_with_events: string[]
  plates_read: string[]
  detections: number
  together: number
  together_at_fact: number
}

export interface GroupTimelineData {
  ready: boolean
  reason?: string
  build_command?: string | null
  id?: string
  days: GroupTimelineDay[]
  events: GroupTimelineEvent[]
  detections: Record<string, GroupTimelineDetection[]>
  methodology?: {
    fact_window_minutes: number
    radius_meters: number | null
    passage_window_minutes?: number | null
    day_margin_minutes: number
    together_seconds: number
    near_fact_minutes: number
    gap_hours: number
  } & Methodology
}
