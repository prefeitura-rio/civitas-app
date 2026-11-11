/**
 * Página de grupos: placas que agem juntas (comboio no fato) e células territoriais, a partir das sementes do
 * ranking Dias de circulação. Cada grupo é um cartão (ou linha da tabela); clicar abre o perfil do grupo.
 */
import '@/modules/vehicle-intelligence/components/groups/groups.css'

import { useEffect, useMemo, useRef, useState } from 'react'

import { ErrorBanner } from '@/modules/vehicle-intelligence/components/error-banner'
import { Toggle } from '@/modules/vehicle-intelligence/components/groups/controls'
import { useFilterOptions } from '@/modules/vehicle-intelligence/components/groups/filter-options'
import { MethodologyTerms } from '@/modules/vehicle-intelligence/components/groups/methodology-terms'
import { NotReadyPanel } from '@/modules/vehicle-intelligence/components/groups/not-ready-panel'
import { PlateDot } from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import { scrollToElement } from '@/modules/vehicle-intelligence/components/groups/use-active-section'
import { useIsInCerco } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import {
  copassagem,
  recorte,
  recorteStorageKey,
} from '@/modules/vehicle-intelligence/config/recortes'
import {
  groupsPath,
  rememberGroupLabels,
  useGroupFilters,
} from '@/modules/vehicle-intelligence/features/groups/api'
import { CellsTable } from '@/modules/vehicle-intelligence/features/groups/components/list/cells-table'
import { GroupCard } from '@/modules/vehicle-intelligence/features/groups/components/list/group-card'
import { GroupsFilters } from '@/modules/vehicle-intelligence/features/groups/components/list/groups-filters'
import { GroupsTable } from '@/modules/vehicle-intelligence/features/groups/components/list/groups-table'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type {
  Group,
  GroupsData,
} from '@/modules/vehicle-intelligence/types/groups'

const { items: ITEMS } = recorte.groups

/** Os critérios do fim da página: [termo, chave da metodologia]. */
const METHODOLOGY_TERMS = [
  ['Semente', 'seeds'],
  ['Acaso', 'chance'],
  ['Ligação forte', 'strong_link'],
  ['Grupo', 'group'],
  ['Célula territorial', 'cell'],
  ['Território', 'territory'],
] as const

type ViewMode = 'cartoes' | 'tabela'
const VIEW_MODE_KEY = recorteStorageKey('grupos:vista')

function readViewMode(): ViewMode {
  try {
    return window.localStorage.getItem(VIEW_MODE_KEY) === 'tabela'
      ? 'tabela'
      : 'cartoes'
  } catch {
    return 'cartoes'
  }
}

export function GroupsView({
  active,
  onOpenGroup,
  onOpenPlate,
}: {
  active: boolean
  onOpenGroup: (plates: string[], label: string) => void
  onOpenPlate: (plate: string) => void
}) {
  const filters = useGroupFilters()
  const options = useFilterOptions()
  const { data, dataPath, error, loading, reload } = useApi<GroupsData>(
    active ? groupsPath(filters) : null,
    {
      delayMs: 180,
    },
  )
  const [onlyKnown, setOnlyKnown] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>(readViewMode)
  const methodologyRef = useRef<HTMLElement>(null)
  const isInCerco = useIsInCerco()
  useEffect(() => {
    if (data && dataPath) rememberGroupLabels(dataPath, data)
  }, [data, dataPath])
  const changeViewMode = (value: ViewMode) => {
    setViewMode(value)
    try {
      window.localStorage.setItem(VIEW_MODE_KEY, value)
    } catch {
      /* só não lembra da escolha */
    }
  }
  const visibleGroups = useMemo(
    () =>
      (data?.groups ?? []).filter(
        (group) =>
          !onlyKnown ||
          group.members.some((m) => m.cited || isInCerco(m.plate)),
      ),
    [data, onlyKnown, isInCerco],
  )
  const openGroup = (group: Group) => {
    onOpenGroup(
      group.members.map((m) => m.plate),
      group.label,
    )
    window.scrollTo(0, 0)
  }
  const scrollToMethodology = () => scrollToElement(methodologyRef.current, 100)

  return (
    <div className="groups-page">
      <section className="groups-intro">
        <div>
          <h2>Grupos de suspeitas</h2>
          <p>{recorte.groups.intro}</p>
        </div>
        <button
          type="button"
          className="group-link"
          onClick={scrollToMethodology}
        >
          Como os grupos são formados ↓
        </button>
      </section>

      {options && <GroupsFilters filters={filters} options={options} />}

      {error && <ErrorBanner message={error} onRetry={reload} />}
      {data && loading && (
        <p role="status" className="groups-status">
          Aplicando os filtros…
        </p>
      )}
      {!data && !error && (
        <p role="status" className="groups-status">
          Montando os grupos…
        </p>
      )}
      {data && !data.ready && (
        <NotReadyPanel reason={data.reason} buildCommand={data.build_command} />
      )}

      {data?.ready && data.summary && data.parameters && (
        <>
          <section className="groups-kpis" aria-label="Resumo">
            <div>
              <strong>{formatNumber(data.summary.groups)}</strong>
              <span>
                grupos, com {formatNumber(data.summary.members)} placas
              </span>
            </div>
            <div>
              <strong>{formatNumber(data.summary.seeds_in_groups)}</strong>
              <span>
                sementes em grupo, de {formatNumber(data.summary.seeds)}
              </span>
            </div>
            <div>
              <strong>{formatNumber(data.summary.strong_links)}</strong>
              <span>ligações fortes</span>
            </div>
            <div>
              <strong>{formatNumber(data.summary.cells)}</strong>
              <span>células territoriais</span>
            </div>
          </section>

          <section className="groups-panel">
            <div className="groups-panel-head">
              <div>
                <h2>
                  {onlyKnown
                    ? `${visibleGroups.length} de ${data.groups.length} grupos`
                    : `${data.groups.length} grupos`}
                </h2>
                <p>{recorte.groups.orderNote}</p>
              </div>
              <div className="groups-panel-actions">
                <Toggle checked={onlyKnown} onChange={setOnlyKnown}>
                  Só com placa do Cerco ou citada
                </Toggle>
                <div className="group-segments" role="group" aria-label="Vista">
                  {(
                    [
                      ['cartoes', 'Cartões'],
                      ['tabela', 'Tabela'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={viewMode === value}
                      className={viewMode === value ? 'active' : ''}
                      onClick={() => changeViewMode(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="groups-legend">
              <span>
                <PlateDot seed size={9} />
                Semente
              </span>
              <span>
                <PlateDot size={9} />
                Parceira
              </span>
              <span>
                <PlateDot cerco size={9} background="#121717" />
                No Cerco Digital
              </span>
              <span>
                <i className="group-ring-cited with-point" aria-hidden="true" />
                Citada no relato (veículo do autor ou de apoio)
              </span>
              <span>
                <i className="groups-legend-strong" aria-hidden="true" />
                Ligação forte, mais grossa quanto mais{' '}
                {copassagem ? 'ROs em comum' : 'passagens juntas'}
              </span>
            </div>
            {visibleGroups.length === 0 ? (
              <p className="groups-none">Nenhum grupo neste recorte.</p>
            ) : viewMode === 'cartoes' ? (
              <div className="groups-cards">
                {visibleGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onOpen={() => openGroup(group)}
                  />
                ))}
              </div>
            ) : (
              <GroupsTable groups={visibleGroups} onOpen={openGroup} />
            )}
          </section>

          {data.cells.length > 0 && (
            <section className="groups-panel">
              <div className="groups-panel-head">
                <div>
                  <h2>Células territoriais</h2>
                  <p className="wide">
                    Complexos que servem de base a duas ou mais sementes: cada
                    uma, por conta própria e em dias quaisquer, parte ou
                    desconecta perto dele acima da taxa das outras {ITEMS}.
                    Mesmo local de partida não é partida conjunta; por isso
                    placas que não andam com ninguém também aparecem aqui.
                  </p>
                </div>
              </div>
              <CellsTable
                data={data}
                onOpenGroup={openGroup}
                onOpenPlate={onOpenPlate}
              />
            </section>
          )}

          {data.methodology && (
            <section ref={methodologyRef} className="groups-method">
              <div>
                <h2>Como os grupos são formados</h2>
                <p>
                  Universo de {formatNumber(data.summary.universe)} {ITEMS} com{' '}
                  {data.parameters.minimum_partner_events}+ ocorrências, janela
                  de ±{data.parameters.window_minutes} min
                  {data.parameters.radius_meters != null
                    ? ` e raio de ${formatNumber(data.parameters.radius_meters)} m`
                    : ` do fato e ±${data.parameters.passage_window_minutes} min entre passagens com a vítima`}
                  . Evidências do banco {data.parameters.evidence_build}.
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
