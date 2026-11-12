/** Contrato de `/api/<recorte>/v1/territories` e `/territories/profile` (motor `analise/territorios.py`). */
import type {
  ActivitySeries,
  Group,
  GroupEvent,
  GroupPoint,
  Methodology,
  Succession,
  Territory,
} from '@/modules/vehicle-intelligence/types/groups'

/** `also`: outros complexos onde a placa também tem base (ex. parte de um e desconecta perto de outro). */
export interface HighlightedPlate {
  plate: string
  rank: number
  cited: boolean
  also: string[]
}

export interface TerritoryComplex {
  complex: string
  faction: string | null
  latitude: number | null
  longitude: number | null
  /** Região de planejamento do complexo (ex. "Centro"). */
  region: string | null
  /** Na região do recorte (ex. Zona Sul): tende a ser moradia de motos locais; fora dela, origem. */
  in_region: boolean
  plates: number
  highlighted: HighlightedPlate[]
  cited: string[]
  from_outside: number
  with_profile: number
  /** Em motos: quantas têm base pela partida e quantas pela desconexão (uma moto pode ter as duas). */
  departure_plates: number
  disconnection_plates: number
  /** Motos de base que também têm base em outro complexo. */
  shared_plates: number
}

export interface TerritoriesData {
  ready: boolean
  reason?: string
  build_command?: string | null
  region?: string
  /** `base_events`: ROs perto do complexo para ser base (3 em transeuntes; 2 em veículos e carga). */
  parameters?: {
    highlight: number
    minimum_events: number
    ranking_minimum: number
    radius_meters: number
    base_events?: number
    evidence_build: string
    evidence_created_at: string
  }
  summary?: {
    complexes: number
    plates_with_base: number
    universe: number
    highlighted_with_base: number
    highlighted_total: number
    highlighted_multi: number
    plates_multi: number
  }
  complexes: TerritoryComplex[]
  methodology?: Methodology
}

export interface BaseEvidence {
  count: number
  total: number
  lift: number
}

export interface TerritoryMember {
  plate: string
  /** Posição no ranking Dias de circulação (motos com o mínimo do filtro, 5+ por padrão); nulo fora dele. */
  rank: number | null
  highlighted: boolean
  cited: boolean
  group: string | null
  departure: BaseEvidence | null
  disconnection: BaseEvidence | null
  also: Array<{ complex: string; departure: boolean; disconnection: boolean }>
  linked_events: number | null
  coverage: number | null
  circulation_days: number | null
  vehicle_type: string | null
  vehicle_model: string | null
  vehicle_color: string | null
  days_read?: number
  days_without_fact?: number
  first_read?: string
  last_read?: string
  /** % dos dias sem fato com a primeira leitura na região do recorte; nulo com menos de 10 dias sem fato. */
  start_in_region?: number | null
  from_outside?: boolean | null
  /** % das leituras entre 18h e 6h. */
  night?: number | null
}

/**
 * Grupo do território: as placas dele com base no complexo, se o complexo é a célula do grupo e a facção da célula.
 * `edges` traz as ligações fortes (as da página de grupos) e os pares que dividem RO sem ligação forte (`strong` falso).
 * `together`: dias em que 2+ placas do grupo passaram juntas (mesmo equipamento, até 3 min), em todo o histórico.
 */
export type TerritoryGroup = Group & {
  members_with_base: string[]
  is_cell: boolean
  cell_faction: string | null
  together?: { days: number; first: string | null; last: string | null }
}

export interface TerritoryProfileData {
  ready: boolean
  reason?: string
  build_command?: string | null
  complex?: string
  faction?: string | null
  latitude?: number | null
  longitude?: number | null
  region?: string | null
  in_region?: boolean
  recorte_region?: string
  members: TerritoryMember[]
  /** Grupos com célula no complexo ou com alguma moto de base nele (critérios padrão da página de grupos). */
  groups?: TerritoryGroup[]
  events: GroupEvent[]
  points: GroupPoint[]
  territory?: Territory
  trends?: {
    hours: number[]
    weekdays: number[]
    cisps: Array<{ cisp: string; name: string | null; events: number }>
    categories: Array<{ value: string; events: number }>
    modalities: Array<{ value: string; events: number }>
  }
  activity?: ActivitySeries | null
  successions?: Succession[]
  /** `succession_cut`: a partir de quanto a semelhança de rotina conta como parecida (`Succession.similar`); nulo sem a camada de rotinas. */
  parameters?: {
    highlight: number
    minimum_events: number
    ranking_minimum: number
    radius_meters: number
    succession_cut?: number | null
  }
  methodology?: Methodology
}
