import { useEffect, useState } from 'react'

import { getGraph } from '@/modules/vehicle-intelligence/features/correlations/api'
import type { GraphQuery } from '@/modules/vehicle-intelligence/features/correlations/query'
import type {
  CorrelationRankingRow,
  MasterPreData,
} from '@/modules/vehicle-intelligence/types/domain'

/**
 * Placas escolhidas podem estar fora do limite desenhado: busca só as ligações de cada uma (`correlata_selecionada`).
 * `current` é o grafo da consulta `key`, já carregado; sem ele, só as placas escolhidas no ranking são buscadas.
 */
export function useSelectedPlateLinks({
  active,
  query,
  queryKey: key,
  current,
  selectedPlates,
  rankingRows,
}: {
  active: boolean
  query: GraphQuery
  queryKey: string
  current: MasterPreData | null
  selectedPlates: string[]
  rankingRows: Record<string, CorrelationRankingRow>
}) {
  /** Ligações buscadas por placa selecionada; nulo quando a placa não tem ligações elegíveis. */
  const [focused, setFocused] = useState<{
    key: string
    byPlate: Record<string, MasterPreData | null>
  }>({
    key: '',
    byPlate: {},
  })
  const [focusLoading, setFocusLoading] = useState(false)
  const [focusFailure, setFocusFailure] = useState<string | null>(null)

  useEffect(() => {
    setFocusLoading(false)
    if (!active) return
    const known = focused.key === key ? focused.byPlate : {}
    const complete =
      current &&
      (current.graph.total_edges ?? current.graph.edges.length) <=
        current.graph.edges.length
    const missing = selectedPlates.filter(
      (plate) =>
        !(plate in known) &&
        (current || rankingRows[plate]) &&
        !(
          complete &&
          current.candidates.some((candidate) => candidate.plate === plate) &&
          current.graph.edges.some((edge) => edge.target === plate)
        ) &&
        !(
          !rankingRows[plate] &&
          current?.graph.nodes.some(
            (node) => node.id === plate && node.kind !== 'candidate',
          )
        ),
    )
    if (!missing.length) return
    const controller = new AbortController()
    setFocusLoading(true)
    Promise.allSettled(
      missing.map((plate) => getGraph(query, controller.signal, plate)),
    ).then((results) => {
      if (controller.signal.aborted) return
      const byPlate = { ...known }
      results.forEach((result, index) => {
        byPlate[missing[index]] =
          result.status === 'fulfilled' &&
          result.value.ready &&
          result.value.candidates.length
            ? result.value
            : null
      })
      setFocusFailure(
        results.some(
          (result) =>
            result.status === 'rejected' &&
            result.reason?.name !== 'AbortError',
        )
          ? 'Não foi possível carregar as ligações de todas as placas.'
          : null,
      )
      setFocused({ key, byPlate })
      setFocusLoading(false)
    })
    return () => controller.abort()
    // `key` (queryKey) resume a consulta: o efeito roda quando ela muda, não a cada objeto `query` novo.
    // Dependências incompletas de propósito.
  }, [active, current, focused, key, rankingRows, selectedPlates])
  const withoutLinks =
    focused.key === key
      ? selectedPlates.filter((plate) => focused.byPlate[plate] === null)
      : []
  const focusError =
    focusFailure ??
    (withoutLinks.length
      ? `${withoutLinks.join(', ')}: sem ligações elegíveis nos filtros atuais do grafo.`
      : null)
  return { focused, focusLoading, focusError }
}
