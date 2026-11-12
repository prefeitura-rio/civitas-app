import { AlertTriangle, ListFilter, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { QueryLoading } from '@/modules/vehicle-intelligence/components/query-loading'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { Input } from '@/modules/vehicle-intelligence/components/ui/input'
import { Label } from '@/modules/vehicle-intelligence/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/vehicle-intelligence/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/vehicle-intelligence/components/ui/table'
import { TooltipProvider } from '@/modules/vehicle-intelligence/components/ui/tooltip'
import {
  getRanking,
  rankingPath,
} from '@/modules/vehicle-intelligence/features/correlations/api'
import {
  ariaSort,
  ColumnHeader,
} from '@/modules/vehicle-intelligence/features/correlations/components/ranking/column-header'
import { RankingExportControls } from '@/modules/vehicle-intelligence/features/correlations/components/ranking/ranking-export-controls'
import { RankingExportStatus } from '@/modules/vehicle-intelligence/features/correlations/components/ranking/ranking-export-status'
import { RankingPagination } from '@/modules/vehicle-intelligence/features/correlations/components/ranking/ranking-pagination'
import { RankingSkeleton } from '@/modules/vehicle-intelligence/features/correlations/components/ranking/ranking-skeleton'
import { RankingSortSummary } from '@/modules/vehicle-intelligence/features/correlations/components/ranking/ranking-sort-summary'
import { RankingTabs } from '@/modules/vehicle-intelligence/features/correlations/components/ranking/ranking-tabs'
import { useRankingColumns } from '@/modules/vehicle-intelligence/features/correlations/components/ranking/use-ranking-columns'
import { useRankingData } from '@/modules/vehicle-intelligence/features/correlations/components/ranking/use-ranking-data'
import { useRankingExport } from '@/modules/vehicle-intelligence/features/correlations/components/ranking/use-ranking-export'
import type { GraphQuery } from '@/modules/vehicle-intelligence/features/correlations/query'
import type { Column } from '@/modules/vehicle-intelligence/features/correlations/ranking-cells'
import { nextSortTerms } from '@/modules/vehicle-intelligence/features/correlations/ranking-sort'
import { RANKING } from '@/modules/vehicle-intelligence/features/correlations/ranking-variants'
import type { SelectMode } from '@/modules/vehicle-intelligence/features/correlations/selection'
import { cachedResponse } from '@/modules/vehicle-intelligence/lib/api'
import type {
  CorrelationRankingRow,
  CorrelationRankingSort,
  CorrelationRankingSortTerm,
  CorrelationRankingView,
} from '@/modules/vehicle-intelligence/types/domain'

export function RankingTable({
  active,
  query,
  draftPlate,
  onPlateChange,
  selectedPlates,
  onSelectPlate,
  cispNames,
  citedPlateNotes,
}: {
  active: boolean
  /** Consulta aplicada no grafo; a tabela usa os mesmos filtros. */
  query: GraphQuery
  /** Placa digitada e ainda não aplicada nos filtros. */
  draftPlate: string
  onPlateChange: (plate: string) => void
  selectedPlates: string[]
  /** Clique substitui a seleção; Ctrl, Cmd ou Shift + clique soma ou tira a placa. */
  onSelectPlate: (
    plate: string,
    row: CorrelationRankingRow,
    mode: SelectMode,
  ) => void
  cispNames: Record<string, string>
  citedPlateNotes: Record<string, string>
}) {
  const [view, setView] = useState<CorrelationRankingView>('correlations')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortTerms, setSortTerms] = useState<CorrelationRankingSortTerm[]>(() =>
    RANKING.defaultSort('correlations'),
  )
  const viewSettings = useRef(
    new Map<
      CorrelationRankingView,
      { page: number; sortTerms: CorrelationRankingSortTerm[] }
    >(),
  )
  const prefetchPending = useRef(false)
  const prefetchController = useRef<AbortController | null>(null)
  const plate = query.plateFilter
  // O limite de placas desenhadas não muda o ranking.
  const scopeKey = JSON.stringify({ ...query, graphLimit: 0 })
  const path = (
    nextView: CorrelationRankingView,
    nextPage: number,
    terms: CorrelationRankingSortTerm[],
    size = pageSize,
  ) => rankingPath(query, nextView, plate, nextPage, size, terms)
  const currentPath = path(view, page, sortTerms)
  const queryKey = currentPath
  useEffect(
    () => () => {
      prefetchController.current?.abort()
    },
    [active, scopeKey, plate],
  )

  useEffect(() => {
    setPage(1)
    for (const settings of viewSettings.current.values()) settings.page = 1
  }, [scopeKey])
  const exporter = useRankingExport(view, scopeKey, plate, sortTerms, (size) =>
    path(view, 1, sortTerms, size),
  )
  const { data, currentData, error, retry } = useRankingData(
    active,
    currentPath,
    plate,
    view,
  )
  const updating = !currentData && !error

  /** Antecipa uma consulta por vez, só sobre um recorte já carregado. */
  const prefetch = (
    nextView: CorrelationRankingView,
    nextPage: number,
    terms: CorrelationRankingSortTerm[],
  ) => {
    if (!active || !currentData || !data?.ready || prefetchPending.current)
      return
    const nextPath = path(nextView, nextPage, terms)
    if (cachedResponse(nextPath)) return
    prefetchPending.current = true
    const controller = new AbortController()
    prefetchController.current = controller
    void getRanking(nextPath, controller.signal)
      .catch(() => undefined)
      .finally(() => {
        prefetchPending.current = false
      })
  }
  const handleSortIntent = (key: CorrelationRankingSort, additive: boolean) => {
    if (data?.pagination.total)
      prefetch(view, 1, nextSortTerms(sortTerms, key, additive))
  }
  const prepareView = (nextView: CorrelationRankingView) => {
    if (nextView === view) return
    const settings = viewSettings.current.get(nextView)
    prefetch(
      nextView,
      settings?.page ?? 1,
      settings?.sortTerms ?? RANKING.defaultSort(nextView),
    )
  }
  useEffect(() => {
    if (!active || !currentData || !sortTerms.length || !data?.pagination.total)
      return
    const timer = window.setTimeout(
      () =>
        prefetch(view, 1, nextSortTerms(sortTerms, sortTerms[0].key, false)),
      350,
    )
    return () => window.clearTimeout(timer)
    // Uma pré-carga por resultado novo; trocar a ordem ou a vista já pré-carrega pelo handler.
    // Dependências incompletas de propósito.
  }, [active, currentData, queryKey])

  const handleSort = (key: CorrelationRankingSort, additive: boolean) => {
    setSortTerms((current) => nextSortTerms(current, key, additive))
    setPage(1)
  }
  const changeView = (nextView: CorrelationRankingView) => {
    viewSettings.current.set(view, { page, sortTerms })
    const settings = viewSettings.current.get(nextView)
    setView(nextView)
    setSortTerms(settings?.sortTerms ?? RANKING.defaultSort(nextView))
    setPage(settings?.page ?? 1)
  }

  const columns = useRankingColumns({
    view,
    data,
    currentData,
    selectedPlates,
    onSelectPlate,
    cispNames,
    citedPlateNotes,
    onSort: handleSort,
  })

  const pagination = data?.pagination
  const header = (column: Column) => (
    <ColumnHeader
      column={column}
      sortTerms={sortTerms}
      onSort={handleSort}
      onSortIntent={handleSortIntent}
    />
  )
  return (
    <TooltipProvider>
      <section className="panel correlation-ranking-panel" aria-busy={updating}>
        <div className="panel-heading ranking-heading">
          <div>
            <span className="eyebrow">LEITURA ORDENADA DAS CORRELAÇÕES</span>
            <h2>Análise das placas correlatas</h2>
            <p>{RANKING.intro}</p>
          </div>
        </div>
        <RankingTabs
          view={view}
          onChange={changeView}
          onPrepare={prepareView}
        />
        <div className="ranking-toolbar">
          <div className="ranking-search">
            <Search size={17} />
            <Label htmlFor="ranking-plate-search">Filtrar por placa</Label>
            <Input
              id="ranking-plate-search"
              value={draftPlate}
              onChange={(event) => onPlateChange(event.target.value)}
              placeholder={RANKING.searchPlaceholder}
            />
          </div>
          {sortTerms.length > 0 && (
            <RankingSortSummary
              sortTerms={sortTerms}
              onSort={handleSort}
              onKeepFirst={() => {
                setSortTerms([sortTerms[0]])
                setPage(1)
              }}
            />
          )}
          <div className="ranking-page-size">
            <Label htmlFor="ranking-page-size">Linhas por página</Label>
            <Select
              value={String(pageSize)}
              onValueChange={(next) => {
                setPageSize(Number(next))
                setPage(1)
              }}
            >
              <SelectTrigger id="ranking-page-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <RankingExportControls
            exporter={exporter}
            unavailable={!currentData || !data?.ready || !data.pagination.total}
          />
          <div className="ranking-loading">
            <ListFilter size={16} />
            {currentData
              ? 'Ranking independente do limite visual'
              : error
                ? 'Consulta não concluída'
                : 'Atualização em andamento'}
          </div>
        </div>
        <RankingExportStatus exportStatus={exporter.exportStatus} />
        {error && (
          <div className="ranking-error" role="alert">
            <AlertTriangle size={17} />
            {error}
            <Button type="button" variant="outline" onClick={retry}>
              Tentar novamente
            </Button>
          </div>
        )}
        {updating && (
          <QueryLoading
            key={queryKey}
            compact
            label={`Atualizando ${RANKING.tabs.find((tab) => tab.id === view)?.label.toLowerCase()}…`}
            detail={
              data?.ready
                ? 'A tabela anterior permanece visível até a nova resposta.'
                : 'Grafo e tabela carregam de forma independente.'
            }
          />
        )}
        {data?.ready && (
          <>
            <div className="ranking-method">
              <strong>{RANKING.basis(query, data)}</strong> Todas as associações
              deste recorte entram no cálculo, inclusive as de placas fora do
              grafo exibido. O limite visual e a paginação não alteram os totais
              nem a ordenação. A exportação usa os mesmos critérios.
            </div>
            <div className="ranking-method">{data.methodology}</div>
            <div
              className={`table-scroll ranking-table-scroll${currentData ? '' : ' query-stale'}`}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        key={column.key}
                        aria-sort={ariaSort(column, sortTerms)}
                      >
                        {header(column)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.length ? (
                    data.rows.map((row, index) => (
                      <TableRow
                        key={`${view}-${row.plate}-${row.event_date || row.stolen_event_id || index}`}
                        data-state={
                          selectedPlates.includes(row.plate)
                            ? 'selected'
                            : undefined
                        }
                      >
                        {columns.map((column) => (
                          <TableCell key={column.key} data-label={column.label}>
                            {column.render(row, index)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        className="ranking-empty"
                        colSpan={columns.length}
                      >
                        Nenhuma placa encontrada neste recorte.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {pagination && (
              <RankingPagination
                pagination={pagination}
                currentData={currentData}
                setPage={setPage}
              />
            )}
          </>
        )}
        {currentData && data && !data.ready && (
          <div className="ranking-method">
            {data.methodology ||
              'O ranking ainda não está disponível nesta base.'}
          </div>
        )}
        {!data && <RankingSkeleton columns={columns} header={header} />}
      </section>
    </TooltipProvider>
  )
}
