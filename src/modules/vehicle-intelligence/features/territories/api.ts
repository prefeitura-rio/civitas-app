/**
 * Territórios: filtros (os mesmos na lista e no perfil, guardados por recorte) e caminhos da API (lidos com `useApi`).
 * Os filtros de fato são os da página de grupos; "Em destaque" é o corte do ranking Dias de circulação.
 */
import {
  recorte,
  recorteStorageKey,
} from '@/modules/vehicle-intelligence/config/recortes'
import { createStore } from '@/modules/vehicle-intelligence/lib/store'

export interface TerritoryFilters {
  meses: number | null
  modalidades: string[]
  alvos: string[]
  deslocamentos: string[]
  cisps: string[]
  /** Corte do ranking Dias de circulação para "em destaque". */
  destaque: number
  /** Ocorrências mínimas das placas que contam posição no ranking (transeuntes: 5 = padrão, 10 = a régua das sementes). */
  rankingMinimo: number
  taxis: 'excluir_taxis' | 'todos'
}

/** O destaque padrão do recorte (`config/recortes.ts`): top 500 das motos 5+ em transeuntes, top 500 das 4+ em veículos… */
const [HIGHLIGHT_CUT, HIGHLIGHT_MINIMUM] = recorte.groups.highlights[0]
export const DEFAULT_TERRITORY_FILTERS: TerritoryFilters = {
  meses: null,
  modalidades: [],
  alvos: [],
  deslocamentos: [],
  cisps: [],
  destaque: HIGHLIGHT_CUT,
  rankingMinimo: HIGHLIGHT_MINIMUM,
  taxis: 'excluir_taxis',
}

// v2: o padrão passou a top 500 das motos 5+ (13/10); a chave nova não herda o top 300 guardado antes.
const filtersStore = createStore(DEFAULT_TERRITORY_FILTERS, {
  storageKey: recorteStorageKey('territorios:filtros:v2'),
})
export const setTerritoryFilters = filtersStore.set
export const useTerritoryFilters = filtersStore.use

export const isDefaultTerritory = (filters: TerritoryFilters) =>
  JSON.stringify(filters) === JSON.stringify(DEFAULT_TERRITORY_FILTERS)

function params(filters: TerritoryFilters): URLSearchParams {
  const query = new URLSearchParams()
  if (filters.meses) query.set('meses', String(filters.meses))
  filters.modalidades.forEach((value) => query.append('modalidade', value))
  filters.alvos.forEach((value) => query.append('alvo', value))
  filters.deslocamentos.forEach((value) => query.append('deslocamento', value))
  filters.cisps.forEach((value) => query.append('cisp', value))
  query.set('destaque', String(filters.destaque))
  query.set('ranking_minimo', String(filters.rankingMinimo))
  query.set('taxis', filters.taxis)
  if (recorte.groups.motorcyclesOnly) query.set('veiculo', 'MOTO')
  return query
}

/** A lista de complexos com os filtros. */
export const territoriesPath = (filters: TerritoryFilters) =>
  `/api/v1/territories?${params(filters)}`

/** O perfil do complexo com os filtros. */
export function territoryProfilePath(
  complex: string,
  filters: TerritoryFilters,
) {
  const query = params(filters)
  query.set('complexo', complex)
  return `/api/v1/territories/profile?${query}`
}
