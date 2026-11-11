/** Perfil do RO: os caminhos da API (lidos com `useApi`). */
import type {
  OccurrenceAppliedFilters,
  OccurrenceWindows,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/types'

/** ROs pelo número (inteiro ou trecho) ou pela placa vítima. */
export const occurrenceSearchPath = (query: string) =>
  `/api/v1/occurrences/search?${new URLSearchParams({ q: query.trim() })}`

/** As janelas escolhidas na tela; as ausentes ficam com a padrão do recorte. */
export type WindowChoice = Partial<OccurrenceWindows>

/** Os filtros de placa escolhidos na tela (os mesmos nomes do eco da API, sem `active`). */
export type PlateFilterChoice = Omit<OccurrenceAppliedFilters, 'active'>

export const DEFAULT_PLATE_FILTERS: PlateFilterChoice = {
  vehicle_types: [],
  taxis: 'todos',
  denuncias: 'todos',
  plate_type: 'todas',
  when: 'qualquer',
  min_readings: 1,
  // Placa lida 1 ou 2 vezes no período inteiro: quase sempre erro de leitura ou coincidência (cobertura de 100%).
  min_detections: 3,
  min_strength: null,
  activity_days: null,
  model: '',
  min_links: 1,
  days: 'todos',
}

/** Os filtros que tiram alguma placa (para o "Limpar" e a contagem de "Mais filtros"). */
export function activeFilterKeys(
  filters: PlateFilterChoice,
): Array<keyof PlateFilterChoice> {
  return (
    Object.keys(DEFAULT_PLATE_FILTERS) as Array<keyof PlateFilterChoice>
  ).filter((key) =>
    key === 'vehicle_types'
      ? filters.vehicle_types.length > 0
      : key === 'model'
        ? filters.model.trim() !== ''
        : filters[key] !== DEFAULT_PLATE_FILTERS[key],
  )
}

/** A ordem das listas na API (`analise.ocorrencia.ORDENS`). */
export type ServerSort =
  | 'sinal'
  | 'tempo'
  | 'dias'
  | 'no_dia'
  | 'ligacoes'
  | 'forca'
  | 'junto'
  | 'distancia'
  | 'placa'

/** A query do perfil (o RO, as janelas, os filtros de placa e a ordem); o relatório do RO usa a mesma. */
export function occurrenceProfileQuery(
  ro: string,
  windows: WindowChoice,
  filters = DEFAULT_PLATE_FILTERS,
  sort: ServerSort = 'sinal',
  inverted = false,
): string {
  const query = new URLSearchParams({ ro })
  const params: Array<[string, number | null | undefined]> = [
    ['janela_evento', windows.event_window_minutes],
    ['janela_correlacao', windows.passage_window_minutes],
    ['raio_metros', windows.radius_meters],
    ['janela_perto', windows.near_window_minutes],
  ]
  for (const [name, value] of params) if (value) query.set(name, String(value))
  for (const type of [...filters.vehicle_types].sort())
    query.append('veiculo', type)
  const choices: Array<[string, string, string]> = [
    ['taxis', filters.taxis, 'todos'],
    ['denuncias', filters.denuncias, 'todos'],
    ['tipo_placa', filters.plate_type, 'todas'],
    ['quando', filters.when, 'qualquer'],
    ['dias', filters.days, 'todos'],
    ['ordem', sort, 'sinal'],
  ]
  for (const [name, value, fallback] of choices)
    if (value !== fallback) query.set(name, value)
  if (filters.min_readings > 1)
    query.set('leituras_min', String(filters.min_readings))
  if (filters.min_detections > 1)
    query.set('deteccoes_min', String(filters.min_detections))
  if (filters.min_strength) query.set('forca_min', String(filters.min_strength))
  if (filters.activity_days)
    query.set('atividade_dias', String(filters.activity_days))
  if (filters.model.trim()) query.set('modelo', filters.model.trim())
  if (filters.min_links > 1)
    query.set('ligacoes_min', String(filters.min_links))
  if (inverted && sort !== 'sinal') query.set('invertida', 'true')
  return query.toString()
}

/** O perfil do RO na query de `occurrenceProfileQuery`. */
export const occurrenceProfilePath = (query: string) =>
  `/api/v1/occurrences/profile?${query}`
