import {
  copassagem,
  recorteStorageKey,
} from '@/modules/vehicle-intelligence/config/recortes'
import {
  allowed,
  DEFAULT_EVENT_SCOPE,
  type EventScope,
  SCOPE_LIMITS,
} from '@/modules/vehicle-intelligence/stores/event-scope'
import type {
  DenunciaFilter,
  MasterGraphOptions,
  PlateTypeFilter,
  TaxiFilter,
} from '@/modules/vehicle-intelligence/types/domain'

/** Filtros de placa: valem no grafo e no ranking, não no perfil. */
export interface PlateFilters {
  plateFilter: string
  veiculos: string[]
  plateType: PlateTypeFilter
  taxiFilter: TaxiFilter
  /** Disque Denúncia: só as placas citadas numa denúncia, sem elas ou todas. */
  denunciaFilter: DenunciaFilter
  /** Detecções da placa em todo o período: com 1 ou 2, quase sempre erro de leitura ou coincidência. */
  minPlateDetections: number
  /** Fatos distintos ligados à placa. */
  minEvents: number
  /** Copassagem: placas vítimas distintas ligadas à placa. */
  minVictims: number
  minTemperature: number
  activityDays: number
  graphLimit: number
}

/** Consulta do grafo e do ranking: o recorte global de fatos mais os filtros de placa. */
export type GraphQuery = EventScope & PlateFilters

export const DEFAULT_PLATE_FILTERS: PlateFilters = {
  plateFilter: '',
  veiculos: [],
  plateType: 'todas',
  taxiFilter: 'todos',
  denunciaFilter: 'todos',
  minPlateDetections: 3,
  minEvents: copassagem ? 1 : 2,
  minVictims: 1,
  minTemperature: 0,
  activityDays: 0,
  graphLimit: copassagem ? 1000 : 500,
}
export const DEFAULT_QUERY: GraphQuery = {
  ...DEFAULT_EVENT_SCOPE,
  ...DEFAULT_PLATE_FILTERS,
}
const PLATE_KEYS = Object.keys(DEFAULT_PLATE_FILTERS) as Array<
  keyof PlateFilters
>

export function plateFilters(query: GraphQuery): PlateFilters {
  return Object.fromEntries(
    PLATE_KEYS.map((key) => [key, query[key]]),
  ) as unknown as PlateFilters
}

/** Listas valem como conjuntos: a ordem da seleção não muda a consulta. */
function normalized(value: unknown): unknown {
  return Array.isArray(value) ? [...value].sort() : value
}

export function changedKeys(
  a: GraphQuery,
  b: GraphQuery,
): Array<keyof GraphQuery> {
  return (Object.keys(DEFAULT_QUERY) as Array<keyof GraphQuery>).filter(
    (key) =>
      JSON.stringify(normalized(a[key])) !== JSON.stringify(normalized(b[key])),
  )
}

export function queryKey(query: GraphQuery): string {
  return JSON.stringify([
    recorteStorageKey('query'),
    ...(Object.keys(DEFAULT_QUERY) as Array<keyof GraphQuery>).map((key) =>
      normalized(query[key]),
    ),
  ])
}

/** Janelas e raios fora do que a base publica voltam ao valor mais próximo oferecido. */
export function fitToOptions(
  query: GraphQuery,
  options: MasterGraphOptions | null,
): GraphQuery {
  const fit = (value: number, offered: number[], fallback: number) =>
    !offered.length || offered.includes(value)
      ? value
      : (offered.at(-1) ?? fallback)
  return {
    ...query,
    eventWindow: fit(
      query.eventWindow,
      allowed(
        options?.available_event_window_minutes,
        SCOPE_LIMITS.eventWindows,
      ),
      DEFAULT_EVENT_SCOPE.eventWindow,
    ),
    radius: fit(
      query.radius,
      allowed(options?.available_radius_meters, SCOPE_LIMITS.radii),
      DEFAULT_EVENT_SCOPE.radius,
    ),
    passageWindow: fit(
      query.passageWindow,
      allowed(
        options?.available_passage_window_minutes,
        SCOPE_LIMITS.passageWindows,
      ),
      DEFAULT_EVENT_SCOPE.passageWindow,
    ),
  }
}
