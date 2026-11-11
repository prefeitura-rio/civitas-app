import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { ReadError } from '@/modules/vehicle-intelligence/components/error-banner'
import { QueryLoading } from '@/modules/vehicle-intelligence/components/query-loading'
import { activityHelpText } from '@/modules/vehicle-intelligence/features/correlations/activity-help'
import { getGraph } from '@/modules/vehicle-intelligence/features/correlations/api'
import { GraphKpis } from '@/modules/vehicle-intelligence/features/correlations/components/correlation/graph-kpis'
import { GraphLimitNote } from '@/modules/vehicle-intelligence/features/correlations/components/correlation/graph-limit-note'
import { GraphPlaceholder } from '@/modules/vehicle-intelligence/features/correlations/components/correlation/graph-placeholder'
import { MaterializationCallout } from '@/modules/vehicle-intelligence/features/correlations/components/correlation/materialization-callout'
import { useSelectedPlateLinks } from '@/modules/vehicle-intelligence/features/correlations/components/correlation/use-selected-plate-links'
import {
  FilterRail,
  useGraphFilterDraft,
} from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail'
import { RankingTable } from '@/modules/vehicle-intelligence/features/correlations/components/ranking-table'
import type { GraphData } from '@/modules/vehicle-intelligence/features/correlations/graph-display'
import {
  EMPTY_GRAPH,
  mergeGraphs,
} from '@/modules/vehicle-intelligence/features/correlations/graph-merge'
import {
  DEFAULT_PLATE_FILTERS,
  fitToOptions,
  type GraphQuery,
  type PlateFilters,
  plateFilters,
  queryKey,
} from '@/modules/vehicle-intelligence/features/correlations/query'
import { SCREEN } from '@/modules/vehicle-intelligence/features/correlations/screen-variants'
import {
  nextSelection,
  sanitizePlates,
  type SelectMode,
} from '@/modules/vehicle-intelligence/features/correlations/selection'
import {
  cachedGraph,
  cachedOptions,
  loadCorrelationSession,
  rememberGraph,
  rememberOptions,
  saveCorrelationSession,
} from '@/modules/vehicle-intelligence/features/correlations/session'
import { getMasterGraphOptions } from '@/modules/vehicle-intelligence/lib/api'
import {
  DEFAULT_EVENT_SCOPE,
  type EventScope,
  useEventScope,
} from '@/modules/vehicle-intelligence/stores/event-scope'
import type {
  CorrelationRankingRow,
  MasterGraphOptions,
  MasterPreData,
} from '@/modules/vehicle-intelligence/types/domain'

const NetworkGraph = lazy(() =>
  import(
    '@/modules/vehicle-intelligence/features/correlations/components/network-graph'
  ).then((module) => ({ default: module.NetworkGraph })),
)

export function CorrelationView({
  active,
  onOpenPlate,
  onOpenOccurrence,
}: {
  active: boolean
  onOpenPlate: (plate: string, analysis: 'correlations' | 'trends') => void
  /** O perfil do RO (ou os ROs de uma placa vítima), do inspetor da âncora. */
  onOpenOccurrence: (key: string) => void
}) {
  const restored = useRef(loadCorrelationSession()).current
  // Os filtros de fato são o recorte global (valem no perfil e na timeline); os de placa ficam no grafo.
  const { scope, setScope } = useEventScope()
  const [plates, setPlates] = useState<PlateFilters>(
    restored?.plates ?? DEFAULT_PLATE_FILTERS,
  )
  const [options, setOptions] = useState<MasterGraphOptions | null>(
    cachedOptions,
  )
  const query = useMemo(
    () => fitToOptions({ ...scope, ...plates }, options),
    [scope, plates, options],
  )
  const key = queryKey(query)
  const [pending, setPending] = useGraphFilterDraft(query)
  const [selectedPlates, setSelectedPlates] = useState<string[]>(
    restored?.selectedPlates ?? [],
  )
  /** Linhas do ranking das placas selecionadas por ele: fora do desenho, alimentam o nó provisório e o inspetor. */
  const [rankingRows, setRankingRows] = useState<
    Record<string, CorrelationRankingRow>
  >({})
  const [selectionRevision, setSelectionRevision] = useState(0)
  const graphAreaRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<MasterPreData | null>(() => cachedGraph(key))
  const [dataKey, setDataKey] = useState<string | null>(() =>
    cachedGraph(key) ? key : null,
  )
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const current = data?.ready && dataKey === key ? data : null
  const updating = loading || dataKey !== key

  useEffect(() => {
    setRankingRows({})
  }, [key])
  const selectedRows = useMemo(
    () => selectedPlates.filter((plate) => rankingRows[plate]),
    [rankingRows, selectedPlates],
  )
  const session = useRef({
    plates,
    selectedPlates,
    scrollY: restored?.scrollY ?? 0,
  })
  session.current = { plates, selectedPlates, scrollY: session.current.scrollY }
  const persist = useCallback(
    () =>
      saveCorrelationSession({ ...session.current, scrollY: window.scrollY }),
    [],
  )
  useEffect(persist, [key, selectedPlates, persist])
  useEffect(() => persist, [persist])

  useEffect(() => {
    const controller = new AbortController()
    getMasterGraphOptions(controller.signal)
      .then((next) => {
        rememberOptions(next)
        setOptions((value) => value ?? next)
      })
      .catch((reason) => {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'Falha ao carregar os filtros do grafo',
          )
          setLoading(false)
        }
      })
    return () => controller.abort()
  }, [retry])

  useEffect(() => {
    if (!active || !options || (data && dataKey === key)) return
    const memory = cachedGraph(key)
    if (memory) {
      setData(memory)
      setDataKey(key)
      setLoading(false)
      setError(null)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    getGraph(query, controller.signal)
      .then((next) => {
        if (!controller.signal.aborted) {
          rememberGraph(key, next)
          setData(next)
          setDataKey(key)
        }
      })
      .catch((reason) => {
        if (reason.name !== 'AbortError')
          setError(
            reason instanceof Error ? reason.message : 'Falha na leitura local',
          )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
    // `key` (queryKey) resume a consulta: o efeito roda quando ela muda, não a cada objeto `query` novo.
    // Dependências incompletas de propósito.
  }, [active, options, key, data, dataKey, retry])

  const restoredScroll = useRef(false)
  useEffect(() => {
    if (restoredScroll.current || !restored || !data?.ready) return
    restoredScroll.current = true
    window.requestAnimationFrame(() =>
      window.scrollTo({ top: restored.scrollY, behavior: 'auto' }),
    )
  }, [data, restored])

  const { focused, focusLoading, focusError } = useSelectedPlateLinks({
    active,
    query,
    queryKey: key,
    current,
    selectedPlates,
    rankingRows,
  })

  const graphData = useMemo<GraphData | null>(() => {
    const extras =
      focused.key === key
        ? selectedPlates.flatMap((plate) => focused.byPlate[plate] ?? [])
        : []
    if (!current && !extras.length && !selectedRows.length)
      return data?.ready ? data : null
    return mergeGraphs(
      current ?? extras[0] ?? EMPTY_GRAPH,
      extras,
      selectedRows,
    )
  }, [current, data, focused, key, selectedPlates, selectedRows])

  const citedPlateNotes = useMemo(
    () =>
      Object.fromEntries(
        (data?.authorship_plate_citations ?? []).map((item) => [
          item.plate,
          item.note,
        ]),
      ),
    [data?.authorship_plate_citations],
  )
  const activityHelp = activityHelpText(data?.activity)
  const select = useCallback(
    (
      plate: string | null,
      mode: SelectMode = 'replace',
      row?: CorrelationRankingRow,
    ) => {
      setSelectedPlates((current) => nextSelection(current, plate, mode))
      if (row) setRankingRows((rows) => ({ ...rows, [row.plate]: row }))
      setSelectionRevision((value) => value + 1)
    },
    [],
  )
  const selectRankingPlate = useCallback(
    (plate: string, row: CorrelationRankingRow, mode: SelectMode) => {
      select(plate, mode, row)
      // Somar placas com Ctrl+clique não tira a pessoa da tabela.
      if (mode !== 'replace') return
      graphAreaRef.current
        ?.querySelector('.force-network-shell')
        ?.scrollIntoView({
          block: 'start',
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'auto'
            : 'smooth',
        })
      graphAreaRef.current?.focus({ preventScroll: true })
    },
    [select],
  )
  const apply = (next: GraphQuery) => {
    setScope(
      Object.fromEntries(
        Object.keys(DEFAULT_EVENT_SCOPE).map((field) => [
          field,
          next[field as keyof EventScope],
        ]),
      ) as Partial<EventScope>,
    )
    setPlates(plateFilters(next))
    select(null)
  }

  return (
    <div className="module-stack">
      <section className="module-hero">
        <div>
          <span className="eyebrow">{SCREEN.eyebrow}</span>
          <h2>{SCREEN.title}</h2>
          <p>{SCREEN.text}</p>
        </div>
      </section>
      {error && (
        <ReadError
          message={error}
          onRetry={() => {
            setError(null)
            setLoading(true)
            setRetry((value) => value + 1)
          }}
        />
      )}
      {data && !data.ready && <MaterializationCallout data={data} />}
      {data?.ready && <GraphKpis data={data} />}
      <div className="correlation-graph-layout">
        <FilterRail
          applied={query}
          pending={pending}
          setPending={setPending}
          options={options}
          loading={updating}
          error={error}
          activityHelp={activityHelp}
          onApply={apply}
        />
        <div
          ref={graphAreaRef}
          tabIndex={-1}
          role="region"
          aria-label="Grafo e resumo da placa selecionada"
          style={{ gridArea: 'graph', minWidth: 0 }}
          aria-busy={updating || focusLoading}
        >
          {data?.ready && dataKey !== key && !error && (
            <QueryLoading
              key={key}
              compact
              label="Atualizando o grafo…"
              detail="O desenho anterior permanece visível enquanto os novos filtros são aplicados."
            />
          )}
          {graphData ? (
            <Suspense
              fallback={
                <section className="panel graph-loading">
                  <QueryLoading label="Preparando a rede interativa…" />
                </section>
              }
            >
              <NetworkGraph
                active={active}
                data={graphData}
                stateKey={selectedRows.length ? key : (dataKey ?? 'pending')}
                selectedPlates={selectedPlates}
                rankingRows={rankingRows}
                selectionRevision={selectionRevision}
                focusLoading={focusLoading}
                focusError={focusError}
                loadingData={!error && updating}
                onSelect={select}
                onOpenPlate={onOpenPlate}
                onOpenOccurrence={onOpenOccurrence}
              />
            </Suspense>
          ) : (
            !data && (
              <GraphPlaceholder
                error={error}
                queryKey={key}
                optionsLoaded={Boolean(options)}
              />
            )
          )}
        </div>
      </div>
      <RankingTable
        active={active && Boolean(options)}
        query={query}
        draftPlate={pending.plateFilter}
        onPlateChange={(plate) =>
          setPending((value) => ({
            ...value,
            plateFilter: sanitizePlates(plate),
          }))
        }
        selectedPlates={selectedPlates}
        onSelectPlate={selectRankingPlate}
        cispNames={options?.cisp_names ?? {}}
        citedPlateNotes={citedPlateNotes}
      />
      {data?.ready &&
        data.summary.displayed_candidates < data.summary.candidates && (
          <GraphLimitNote data={data} />
        )}
    </div>
  )
}
