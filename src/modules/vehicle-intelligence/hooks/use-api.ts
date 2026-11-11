/**
 * Leitura da API numa tela: o padrão que cada tela escrevia à mão (AbortController, carregando, erro, tentar de novo).
 * Usa `request()` de `lib/api.ts`, que já guarda as respostas por 5 minutos, junta pedidos iguais e cancela a consulta
 * que ninguém mais espera.
 */
import { useCallback, useEffect, useState } from 'react'

import { cachedResponse, request } from '@/modules/vehicle-intelligence/lib/api'

export interface UseApiOptions {
  /** Espera antes de pedir (ms): filtros mudados em sequência viram um pedido só. */
  delayMs?: number
}

export interface ApiState<T> {
  /** A última resposta recebida; continua na tela enquanto a do caminho novo não chega. */
  data: T | null
  /** O caminho de que `data` é a resposta (para saber se ela já é a do caminho atual). */
  dataPath: string | null
  error: string | null
  loading: boolean
  /** Pede de novo o caminho atual (depois de um erro). */
  reload: () => void
}

type State<T> = Omit<ApiState<T>, 'reload'>

/**
 * A resposta de `path` (um caminho `/api/v1/...` do recorte, com a query). Caminho nulo não pede nada e mantém o que
 * já está na tela, como uma tela escondida ou sem os dados de que a consulta depende. Uma resposta em cache aparece
 * na hora, sem passar por "carregando".
 */
export function useApi<T>(
  path: string | null,
  options: UseApiOptions = {},
): ApiState<T> {
  const { delayMs = 0 } = options
  const [state, setState] = useState<State<T>>(() => {
    const cached = path ? cachedResponse<T>(path) : null
    return {
      data: cached,
      dataPath: cached ? path : null,
      error: null,
      loading: false,
    }
  })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!path) return
    const cached = cachedResponse<T>(path)
    if (cached) {
      setState({ data: cached, dataPath: path, error: null, loading: false })
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, error: null, loading: true }))
      request<T>(path, controller.signal)
        .then((data) => {
          if (!controller.signal.aborted)
            setState({ data, dataPath: path, error: null, loading: false })
        })
        .catch((reason: unknown) => {
          if (controller.signal.aborted) return
          const error =
            reason instanceof Error
              ? reason.message
              : 'Falha na consulta da API'
          setState((current) => ({ ...current, error, loading: false }))
        })
    }, delayMs)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [path, revision, delayMs])

  const reload = useCallback(() => setRevision((current) => current + 1), [])
  return { ...state, reload }
}
