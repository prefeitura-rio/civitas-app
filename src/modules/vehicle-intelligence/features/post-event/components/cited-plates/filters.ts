import {
  ALL_PERIOD,
  type FactPeriodFilter,
  periodDates,
} from '@/modules/vehicle-intelligence/components/filters/analysis-filters'
import type { MasterGraphOptions } from '@/modules/vehicle-intelligence/types/domain'

/** Os filtros do entorno; os de fato têm os nomes da API (modalidade, alvo, deslocamento, cisp). */
export type CitedFilters = {
  modalidades: string[]
  alvos: string[]
  deslocamentos: string[]
  cisps: string[]
  period: FactPeriodFilter
  onlyTracked: boolean
}

export const DEFAULT_CITED_FILTERS: CitedFilters = {
  modalidades: [],
  alvos: [],
  deslocamentos: [],
  cisps: [],
  period: ALL_PERIOD,
  onlyTracked: false,
}

/** A query do pós-evento do entorno; vazia sem filtro. */
export function citedParams(
  filters: CitedFilters,
  factPeriod: MasterGraphOptions['fact_period'],
): string {
  const params = new URLSearchParams()
  filters.modalidades.forEach((item) => params.append('modalidade', item))
  filters.alvos.forEach((item) => params.append('alvo', item))
  filters.deslocamentos.forEach((item) => params.append('deslocamento', item))
  filters.cisps.forEach((item) => params.append('cisp', item))
  const { start, end } = periodDates(filters.period, factPeriod)
  if (start) params.set('inicio', start)
  if (end) params.set('fim', end)
  return params.toString()
}
