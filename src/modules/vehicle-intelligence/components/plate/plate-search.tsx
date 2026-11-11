/**
 * Busca de placas nos três recortes (`/api/placas/busca`), comum ao cabeçalho,
 * à barra do perfil e à página "Perfil de placa".
 *
 * Aceita a placa exata ou um padrão com `-` no lugar de cada caractere que pode
 * variar: RJQ9F9- traz de RJQ9F90 a RJQ9F9Z, as que existirem no banco. Cada
 * resultado mostra, recorte a recorte, os números do perfil sem filtros e abre o
 * perfil no recorte escolhido: o ativo pela navegação do app; os outros
 * recarregam a página no recorte, como o seletor de recorte.
 */
import { type FormEvent, type RefObject, useEffect, useState } from 'react'

import {
  blockedReason,
  parsePlatePattern,
  platePatternInput,
  preferredDestination,
  profileHref,
} from '@/modules/vehicle-intelligence/components/plate/plate-search-logic'
import { RecorteCell } from '@/modules/vehicle-intelligence/components/plate/plate-search-recorte'
import { PlateSignals } from '@/modules/vehicle-intelligence/components/plate/plate-signals'
import {
  recorteAtual,
  RECORTES,
} from '@/modules/vehicle-intelligence/config/recortes'
import { searchPlates } from '@/modules/vehicle-intelligence/lib/api'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import { useEventScope } from '@/modules/vehicle-intelligence/stores/event-scope'
import type {
  PlateProfileAnalysis,
  PlateSearchData,
} from '@/modules/vehicle-intelligence/types/domain'

export type OpenSearchedPlate = (
  plate: string,
  analysis?: PlateProfileAnalysis,
) => void

export const PLATE_PATTERN_HINT =
  'Placa completa ou com - no lugar de cada caractere que pode variar (ex.: RJQ9F9-).'

type SearchState = {
  pattern: string
  data: PlateSearchData | null
  error: string | null
}

function usePlateSearch(pattern: string | null) {
  const [state, setState] = useState<SearchState | null>(null)
  useEffect(() => {
    if (!pattern) return
    const controller = new AbortController()
    // Espera a digitação parar antes de consultar.
    const timer = window.setTimeout(() => {
      searchPlates(pattern, controller.signal).then(
        (data) => setState({ pattern, data, error: null }),
        (reason: unknown) => {
          if (!controller.signal.aborted)
            setState({
              pattern,
              data: null,
              error:
                reason instanceof Error ? reason.message : 'Falha na busca.',
            })
        },
      )
    }, 180)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [pattern])
  const current = pattern && state?.pattern === pattern ? state : null
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: Boolean(pattern) && !current,
  }
}

export type PlateSearchField = ReturnType<typeof usePlateSearchField>

/**
 * Estado do campo de busca e a tecla Enter: com uma placa só, abre o perfil;
 * com várias, leva o foco ao primeiro resultado. Placa exata digitada antes da
 * resposta abre no recorte ativo, como antes da busca nos três recortes.
 */
export function usePlateSearchField(
  onOpenPlate: OpenSearchedPlate,
  onDone?: () => void,
) {
  const [value, setValue] = useState('')
  const { setApplyToPlates } = useEventScope()
  const parsed = parsePlatePattern(value)
  const search = usePlateSearch(parsed.ready ? parsed.pattern : null)
  const open = (plate: string, analysis?: PlateProfileAnalysis) => {
    // A busca olha o grafo inteiro: o perfil abre com "Ver todos os fatos", sem o recorte global da tela.
    setApplyToPlates(false)
    onOpenPlate(plate, analysis)
    setValue('')
    onDone?.()
  }
  const submit = (event: FormEvent, results: RefObject<HTMLElement>) => {
    event.preventDefault()
    if (!parsed.ready) return
    if (!search.data) {
      if (parsed.exact) open(parsed.pattern)
      return
    }
    if (search.data.placas.length === 1) {
      const item = search.data.placas[0]
      const destination = preferredDestination(item)
      // No recorte ativo, pela navegação do app; nos outros, a página recarrega no recorte.
      if (destination?.recorte === recorteAtual)
        open(item.placa, destination.analysis)
      else if (destination)
        window.location.assign(profileHref(item.placa, destination))
      return
    }
    results.current?.querySelector<HTMLElement>('a[href]')?.focus()
  }
  return {
    value,
    setValue: (next: string) => setValue(platePatternInput(next)),
    ...parsed,
    ...search,
    /** Há algo a mostrar abaixo do campo: resultados, carregamento ou o motivo de não buscar. */
    showResults: parsed.ready || Boolean(parsed.problem),
    open,
    submit,
  }
}

/** Lista de placas achadas, com os números de cada recorte. */
export function PlateSearchResults({
  field,
  listRef,
  hint = true,
}: {
  field: PlateSearchField
  listRef?: RefObject<HTMLDivElement>
  hint?: boolean
}) {
  const { data, error, loading, problem, pattern, open } = field
  let body
  if (problem) body = <p className="plate-search-note">{problem}</p>
  else if (loading)
    body = (
      <p className="plate-search-note" role="status">
        Buscando {pattern} nos três recortes…
      </p>
    )
  else if (error)
    body = (
      <p className="plate-search-note is-error" role="alert">
        {error}
      </p>
    )
  else if (data && data.placas.length === 0)
    body = (
      <p className="plate-search-note" role="status">
        Nenhuma placa {data.exata ? data.padrao : `no padrão ${data.padrao}`}{' '}
        nos três recortes.
      </p>
    )
  else if (data) {
    body = (
      <>
        <p className="plate-search-head" role="status">
          <strong>
            {data.exata
              ? 'Nos três recortes'
              : pluralize(data.total, 'placa', 'placas')}
          </strong>
          {!data.exata && <span>no padrão {data.padrao}</span>}
          {data.total > data.placas.length && (
            <span>
              · as {formatNumber(data.placas.length)} mais ligadas a fatos
            </span>
          )}
          <span>· grafo inteiro, sem filtros</span>
        </p>
        <ul className="plate-search-list">
          {data.placas.map((item) => (
            <li key={item.placa} className="plate-search-item">
              <div className="plate-search-plate">
                <strong>{item.placa}</strong>
                {item.invalida && (
                  <span
                    className="signal-chip signal-invalid"
                    title={blockedReason(item) ?? undefined}
                  >
                    <i aria-hidden="true" />
                    Placa inválida
                  </span>
                )}
                {item.onibus_municipal && (
                  <span
                    className="signal-chip signal-bus"
                    title={blockedReason(item) ?? undefined}
                  >
                    <i aria-hidden="true" />
                    Ônibus municipal
                  </span>
                )}
                <PlateSignals row={{ plate: item.placa, ...item.sinais }} />
              </div>
              <div className="plate-search-recortes">
                {RECORTES.map((recorte) => (
                  <RecorteCell
                    key={recorte.id}
                    item={item}
                    recorte={recorte}
                    criteria={data.criterios[recorte.id]}
                    onOpenPlate={open}
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </>
    )
  }
  return (
    <div className="plate-search-results" ref={listRef}>
      {body}
      {hint && <p className="plate-search-hint">{PLATE_PATTERN_HINT}</p>}
    </div>
  )
}
