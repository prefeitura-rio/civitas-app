import {
  ALL_PERIOD,
  type FactPeriodFilter,
  periodDates,
} from '@/modules/vehicle-intelligence/components/filters/analysis-filters'
import { DEFAULT_EVENT_SCOPE } from '@/modules/vehicle-intelligence/stores/event-scope'
import type {
  DashboardFilters,
  MasterGraphOptions,
} from '@/modules/vehicle-intelligence/types/domain'

/** Filtros do pós-evento; `cargoOnly` ("somente carga") restringe veículos aos ROs de roubo de carga. */
export type PostEventFilters = DashboardFilters & {
  cargoOnly?: boolean
  period: FactPeriodFilter
}

export const DEFAULT_FILTERS: PostEventFilters = {
  modalidades: DEFAULT_EVENT_SCOPE.modalidades,
  alvos: [],
  deslocamentos: [],
  cisps: [],
  period: ALL_PERIOD,
}

/** A query do pós-evento: período, modalidades, alvos, CISPs, carga e o tamanho das listas. */
export function postEventParams(
  filters: PostEventFilters,
  factPeriod: MasterGraphOptions['fact_period'],
): URLSearchParams {
  const params = new URLSearchParams()
  const { start, end } = periodDates(filters.period, factPeriod)
  if (start) params.set('inicio', start)
  if (end) params.set('fim', end)
  filters.modalidades.forEach((item) => params.append('modalidade', item))
  filters.alvos.forEach((item) => params.append('alvo', item))
  filters.cisps.forEach((item) => params.append('cisp', item))
  if (filters.cargoOnly) params.set('somente_carga', 'true')
  params.set('limite', '150')
  params.set('ultima_pagina', '1')
  params.set('ultima_por_pagina', '25')
  return params
}
