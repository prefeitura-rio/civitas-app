import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import type { GraphQuery } from '@/modules/vehicle-intelligence/features/correlations/query'
import { searchTerms } from '@/modules/vehicle-intelligence/features/correlations/selection'
import { request } from '@/modules/vehicle-intelligence/lib/api'
import { scopeParams } from '@/modules/vehicle-intelligence/stores/event-scope'
import type {
  CorrelationRankingData,
  CorrelationRankingSortTerm,
  CorrelationRankingView,
  MasterPreData,
} from '@/modules/vehicle-intelligence/types/domain'

function queryParams(query: GraphQuery): URLSearchParams {
  const params = scopeParams(query)
  query.veiculos.forEach((item) => params.append('veiculo', item))
  params.set('min_correlacoes', String(query.minCorrelations))
  params.set('min_eventos', String(query.minEvents))
  if (copassagem) params.set('min_placas_vitimas', String(query.minVictims))
  if (query.minTemperature > 0)
    params.set('temperatura_minima', String(query.minTemperature))
  if (query.activityDays > 0)
    params.set('atividade_dias', String(query.activityDays))
  if (query.plateType !== 'todas') params.set('tipo_placa', query.plateType)
  if (query.taxiFilter !== 'todos') params.set('taxis', query.taxiFilter)
  if (query.denunciaFilter !== 'todos')
    params.set('denuncias', query.denunciaFilter)
  return params
}

/** Uma ou mais placas restringem a rede; `selected` traz as ligações de uma placa mesmo fora do limite desenhado. */
function graphPath(query: GraphQuery, selected?: string): string {
  const params = queryParams(query)
  const plates = selected
    ? [selected]
    : searchTerms(query.plateFilter).filter((plate) =>
        /^[A-Z0-9]{3,8}$/.test(plate),
      )
  plates.forEach((plate) => params.append('placa', plate))
  if (selected) params.set('correlata_selecionada', selected)
  params.set('limite', String(query.graphLimit))
  return `/api/v1/master-graph/pre-event?${params}`
}

export function getGraph(
  query: GraphQuery,
  signal?: AbortSignal,
  selected?: string,
): Promise<MasterPreData> {
  return request<MasterPreData>(graphPath(query, selected), signal)
}

export function rankingPath(
  query: GraphQuery,
  view: CorrelationRankingView,
  search: string,
  page: number,
  pageSize: number,
  sort: CorrelationRankingSortTerm[],
): string {
  const params = queryParams(query)
  // No ranking de copassagem a distância do radar ao fato se chama `raio_metros`.
  const distance = params.get('distancia_fato_metros')
  if (distance) {
    params.delete('distancia_fato_metros')
    params.set('raio_metros', distance)
  }
  params.set('visao', view)
  searchTerms(search)
    .filter((term) => term.length <= 8)
    .forEach((term) => params.append('busca', term))
  params.set('pagina', String(page))
  params.set('por_pagina', String(pageSize))
  sort.forEach((term) => {
    params.append('ordenar_por', term.key)
    params.append('direcao', term.direction)
  })
  return `/api/v1/master-graph/pre-event/rankings?${params}`
}

export const getRanking = (path: string, signal?: AbortSignal) =>
  request<CorrelationRankingData>(path, signal)
