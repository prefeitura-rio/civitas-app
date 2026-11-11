import { useEffect, useRef, useState } from 'react'

import { getRanking } from '@/modules/vehicle-intelligence/features/correlations/api'
import { cachedResponse } from '@/modules/vehicle-intelligence/lib/api'
import type {
  CorrelationRankingData,
  CorrelationRankingView,
} from '@/modules/vehicle-intelligence/types/domain'

/**
 * A página do ranking em `currentPath`. Não usa useApi: a espera de 150 ms vale só quando a busca por placa mudou
 * desde a última consulta, e o erro some assim que outra consulta começa.
 */
export function useRankingData(
  active: boolean,
  currentPath: string,
  plate: string,
  view: CorrelationRankingView,
) {
  const previousSearch = useRef(plate)
  const [storedData, setData] = useState<CorrelationRankingData | null>(null)
  const [dataQueryKey, setDataQueryKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retrySequence, setRetrySequence] = useState(0)
  const queryKey = currentPath
  const cached = cachedResponse<CorrelationRankingData>(currentPath)
  // A tabela anterior continua visível, esmaecida, até a nova resposta chegar.
  const data = cached ?? (storedData?.view === view ? storedData : null)
  const currentData = Boolean(cached || (data && dataQueryKey === queryKey))

  useEffect(() => {
    if (!active) return
    const previous = cachedResponse<CorrelationRankingData>(currentPath)
    if (previous) {
      setData(previous)
      setDataQueryKey(queryKey)
      setError(null)
      return
    }
    const controller = new AbortController()
    setError(null)
    const delay = previousSearch.current === plate ? 0 : 150
    previousSearch.current = plate
    const timer = window.setTimeout(() => {
      getRanking(currentPath, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) {
            setData(result)
            setDataQueryKey(queryKey)
          }
        })
        .catch((reason) => {
          if (!controller.signal.aborted)
            setError(
              reason instanceof Error
                ? reason.message
                : 'Falha ao carregar ranking',
            )
        })
    }, delay)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [active, currentPath, retrySequence, plate, queryKey])

  const retry = () => {
    setError(null)
    setRetrySequence((value) => value + 1)
  }
  return { data, currentData, error, retry }
}
