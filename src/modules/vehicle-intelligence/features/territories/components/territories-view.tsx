/**
 * Territórios: os complexos que servem de base às motos do recorte (partida ou desconexão perto deles, por RO) e,
 * em cada um, as motos em destaque no ranking Dias de circulação. O objetivo é achar bases e placas sem citação nem
 * Cerco. Complexos fora da região do recorte tendem a ser origem; os de dentro, moradia de motos locais.
 */
import '@/modules/vehicle-intelligence/components/groups/groups.css'
import '@/modules/vehicle-intelligence/features/territories/territories.css'

import { useMemo, useRef, useState } from 'react'

import { ErrorBanner } from '@/modules/vehicle-intelligence/components/error-banner'
import { Toggle } from '@/modules/vehicle-intelligence/components/groups/controls'
import { useFilterOptions } from '@/modules/vehicle-intelligence/components/groups/filter-options'
import { MethodologyTerms } from '@/modules/vehicle-intelligence/components/groups/methodology-terms'
import { NotReadyPanel } from '@/modules/vehicle-intelligence/components/groups/not-ready-panel'
import { scrollToElement } from '@/modules/vehicle-intelligence/components/groups/use-active-section'
import { useIsInCerco } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import {
  territoriesPath,
  useTerritoryFilters,
} from '@/modules/vehicle-intelligence/features/territories/api'
import {
  buildComplexRows,
  type RegionFilter,
  type SortKey,
  visibleComplexRows,
} from '@/modules/vehicle-intelligence/features/territories/components/list/complex-rows'
import { ComplexesMap } from '@/modules/vehicle-intelligence/features/territories/components/list/complexes-map'
import { ComplexesTable } from '@/modules/vehicle-intelligence/features/territories/components/list/complexes-table'
import { TerritoriesFilters } from '@/modules/vehicle-intelligence/features/territories/components/list/territories-filters'
import type { TerritoriesData } from '@/modules/vehicle-intelligence/features/territories/types'
import {
  ITEMS,
  ITEMS_TITLE,
  SWAP_ITEM,
} from '@/modules/vehicle-intelligence/features/territories/vocabulary'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

const SORT_OPTIONS: Array<[SortKey, string]> = [
  ['highlighted', 'Em destaque'],
  ['unmarked', 'Sem citação nem Cerco'],
  ['concentration', 'Concentração'],
  ['plates', ITEMS_TITLE],
]
/** Os critérios do fim da página: [termo, chave da metodologia]. */
const METHODOLOGY_TERMS = [
  ['Base', 'base'],
  ['Em destaque', 'highlight'],
  ['Sem citação nem Cerco', 'new'],
  ['Vem de fora', 'outside'],
] as const

export function TerritoriesView({
  active,
  onOpenTerritory,
}: {
  active: boolean
  onOpenTerritory: (complex: string) => void
}) {
  const filters = useTerritoryFilters()
  const options = useFilterOptions()
  const { data, error, loading, reload } = useApi<TerritoriesData>(
    active ? territoriesPath(filters) : null,
    {
      delayMs: 180,
      fallbackError: 'Falha na consulta dos territórios',
    },
  )
  const [region, setRegion] = useState<RegionFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('highlighted')
  const [onlyUnmarked, setOnlyUnmarked] = useState(false)
  const methodologyRef = useRef<HTMLElement>(null)
  const isInCerco = useIsInCerco()
  const regionName = data?.region ?? 'região do recorte'
  const allRows = useMemo(
    () => buildComplexRows(data?.complexes ?? [], isInCerco),
    [data, isInCerco],
  )
  const rows = useMemo(
    () => visibleComplexRows(allRows, region, sortKey, onlyUnmarked),
    [allRows, region, sortKey, onlyUnmarked],
  )
  const unmarkedTotal = useMemo(
    () => new Set(allRows.flatMap((l) => l.unmarked)).size,
    [allRows],
  )
  const scrollToMethodology = () => scrollToElement(methodologyRef.current, 100)
  const openTerritory = (complex: string) => {
    onOpenTerritory(complex)
    window.scrollTo(0, 0)
  }

  return (
    <div className="groups-page">
      <section className="groups-intro">
        <div>
          <h2>Territórios</h2>
          <p>
            Complexos que servem de base às {ITEMS}: elas partem ou desconectam
            perto deles nos dias dos fatos bem acima das outras {ITEMS}. Em cada
            um, as {ITEMS} que estão entre as primeiras do ranking Dias de
            circulação, para achar placas sem citação nem Cerco.
          </p>
        </div>
        <button
          type="button"
          className="group-link"
          onClick={scrollToMethodology}
        >
          Como a base é medida ↓
        </button>
      </section>

      {options && <TerritoriesFilters filters={filters} options={options} />}

      {error && <ErrorBanner message={error} onRetry={reload} />}
      {data && loading && (
        <p role="status" className="groups-status">
          Aplicando os filtros…
        </p>
      )}
      {!data && !error && (
        <p role="status" className="groups-status">
          Medindo as bases das {ITEMS}…
        </p>
      )}
      {data && !data.ready && (
        <NotReadyPanel reason={data.reason} buildCommand={data.build_command} />
      )}

      {data?.ready && data.summary && data.parameters && (
        <>
          <section className="groups-kpis" aria-label="Resumo">
            <div>
              <strong>{formatNumber(data.summary.complexes)}</strong>
              <span>
                complexos com {data.parameters.base_events ?? 3}+ {ITEMS} de
                base
              </span>
            </div>
            <div>
              <strong>{formatNumber(data.summary.plates_with_base)}</strong>
              <span>
                {ITEMS} com base, de {formatNumber(data.summary.universe)} (
                {formatNumber(data.summary.plates_multi)} em mais de um
                complexo)
              </span>
            </div>
            <div>
              <strong>
                {formatNumber(data.summary.highlighted_with_base)}
              </strong>
              <span>
                do top {data.parameters.highlight} ({ITEMS}{' '}
                {data.parameters.ranking_minimum}+) têm base num complexo (
                {formatNumber(data.summary.highlighted_multi)} em mais de um)
              </span>
            </div>
            <div>
              <strong>{formatNumber(unmarkedTotal)}</strong>
              <span>em destaque sem citação nem Cerco</span>
            </div>
          </section>

          <section className="groups-panel">
            <div className="groups-panel-head">
              <div>
                <h2>
                  {rows.length === allRows.length
                    ? `${allRows.length} complexos`
                    : `${rows.length} de ${allRows.length} complexos`}
                </h2>
                <p className="wide">
                  Clique no complexo, no mapa ou na tabela, para ver as placas,
                  quando agem, onde partem e desconectam e as possíveis trocas
                  de {SWAP_ITEM}. Uma placa pode ter base em mais de um complexo
                  (parte de um e desconecta perto de outro, marcada com ↔): por
                  isso as linhas somam mais que o resumo.
                </p>
              </div>
              <div className="groups-panel-actions territory-actions">
                <Toggle checked={onlyUnmarked} onChange={setOnlyUnmarked}>
                  Só com placas sem citação nem Cerco
                </Toggle>
                <div
                  className="group-segments"
                  role="group"
                  aria-label="Região"
                >
                  {(
                    [
                      ['all', 'Todos'],
                      ['outside', `Fora da ${regionName}`],
                      ['inside', `Na ${regionName}`],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={region === value}
                      className={region === value ? 'active' : ''}
                      onClick={() => setRegion(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <ComplexesMap rows={rows} onOpen={openTerritory} />
            <div className="territory-order">
              <span className="group-label">Ordenar por</span>
              <div className="group-segments" role="group" aria-label="Ordem">
                {SORT_OPTIONS.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={sortKey === value}
                    className={sortKey === value ? 'active' : ''}
                    onClick={() => setSortKey(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {rows.length === 0 ? (
              <p className="groups-none">Nenhum complexo com estes filtros.</p>
            ) : (
              <ComplexesTable
                rows={rows}
                highlight={data.parameters.highlight}
                rankingMinimum={data.parameters.ranking_minimum}
                regionName={regionName}
                onOpen={openTerritory}
              />
            )}
          </section>

          {data.methodology && (
            <section ref={methodologyRef} className="groups-method">
              <div>
                <h2>Como a base é medida</h2>
                <p>
                  Universo de {formatNumber(data.summary.universe)} {ITEMS} com{' '}
                  {data.parameters.minimum_events}+ ocorrências, partidas e
                  desconexões a até{' '}
                  {formatNumber(data.parameters.radius_meters)} m do complexo.
                  Insumos do banco {data.parameters.evidence_build}.
                </p>
              </div>
              <MethodologyTerms
                terms={METHODOLOGY_TERMS}
                methodology={data.methodology}
              />
            </section>
          )}
        </>
      )}
    </div>
  )
}
