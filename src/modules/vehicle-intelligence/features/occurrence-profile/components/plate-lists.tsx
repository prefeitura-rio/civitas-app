/**
 * A lista de placas do RO, depois do mapa: o trilho de filtros ao lado (janelas e filtros de placa) e, na copassagem,
 * as abas Junto | Perto; no entorno do fato, só a de perto do local.
 */
import { AlertTriangle } from 'lucide-react'
import { type KeyboardEvent, type ReactElement, useState } from 'react'

import type {
  PlateFilterChoice,
  WindowChoice,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/api'
import { PlateRail } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/plate-rail'
import { PlatesPanel } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/plates-panel'
import type { PlatesKind } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/plates-table'
import {
  appliedSort,
  type PlateSort,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type {
  OccurrencePlateList,
  OccurrenceProfileData,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import {
  formatDistance,
  formatNumber,
} from '@/modules/vehicle-intelligence/lib/format'

type Found = Extract<OccurrenceProfileData, { found: true }>
type Choose = (field: keyof WindowChoice) => (value: number) => void

const TITLES: Record<PlatesKind, string> = {
  together: 'Passaram junto com a vítima',
  nearby: 'Passaram perto do local',
}

const total = (list: OccurrencePlateList | null) =>
  list?.available ? formatNumber(list.total) : '—'

export function PlateLists({
  data,
  loading,
  choose,
  filters,
  onFiltersChange,
  onReset,
  sort,
  inverted,
  onSortChange,
  onInvertedChange,
  onOpenPlate,
}: {
  data: Found
  loading: boolean
  choose: Choose
  filters: PlateFilterChoice
  onFiltersChange: (filters: PlateFilterChoice) => void
  onReset: () => void
  sort: PlateSort
  inverted: boolean
  onSortChange: (sort: PlateSort) => void
  onInvertedChange: (inverted: boolean) => void
  onOpenPlate: (plate: string) => void
}) {
  const { parameters } = data
  const copassagem = data.strategy === 'copassagem'
  // Sem placa junto da vítima e com placas perto, a aba de perto abre primeiro.
  const [tab, setTab] = useState<PlatesKind>(() =>
    copassagem &&
    !(
      data.together?.available &&
      !data.together.unfiltered_total &&
      data.nearby.available &&
      data.nearby.total
    )
      ? 'together'
      : 'nearby',
  )
  const kinds: PlatesKind[] = copassagem ? ['together', 'nearby'] : ['nearby']
  const nearbyPoints = data.nearby.available
    ? data.nearby.points_in_radius
    : null
  const switchWithArrows = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const next = tab === 'together' ? 'nearby' : 'together'
    setTab(next)
    document.getElementById(`occurrence-tab-${next}`)?.focus()
  }

  const panels: Record<PlatesKind, () => ReactElement> = {
    together: () => (
      <PlatesPanel
        kind="together"
        ro={data.ro}
        eventTime={data.occurrence.event_time}
        list={data.together}
        loading={loading}
        title={TITLES.together}
        description={`Placas lidas no mesmo ponto que a placa vítima até ±${parameters.passage_window_minutes} min dela, nas passagens da vítima até ±${parameters.event_window_minutes} min do fato: as ligações do grafo de correlatas.`}
        emptyText="Nenhuma placa passou junto da vítima nestas janelas. Sem passagem da vítima perto do horário do fato, não há com quem comparar."
        sort={sort}
        inverted={inverted}
        applied={[appliedSort(data.sort), data.sort_inverted]}
        onSortChange={onSortChange}
        onInvertedChange={onInvertedChange}
        onOpenPlate={onOpenPlate}
      />
    ),
    nearby: () => (
      <PlatesPanel
        kind="nearby"
        ro={data.ro}
        eventTime={data.occurrence.event_time}
        list={data.nearby}
        loading={loading}
        title={TITLES.nearby}
        description={`Placas lidas nos pontos de coleta até ${formatDistance(parameters.radius_meters)} do local do fato, até ±${parameters.near_window_minutes} min do horário.${nearbyPoints != null ? ` ${formatNumber(nearbyPoints)} ${nearbyPoints === 1 ? 'ponto de coleta' : 'pontos de coleta'} no raio.` : ''}`}
        emptyText={
          nearbyPoints === 0
            ? 'Não há ponto de coleta neste raio: a lista vazia não diz quem passou ali.'
            : 'Nenhuma placa foi lida neste raio e nesta janela.'
        }
        sort={sort}
        inverted={inverted}
        applied={[appliedSort(data.sort), data.sort_inverted]}
        onSortChange={onSortChange}
        onInvertedChange={onInvertedChange}
        onOpenPlate={onOpenPlate}
      />
    ),
  }

  return (
    <section
      className="groups-panel occurrence-lists"
      aria-labelledby="occurrence-lists-title"
    >
      <div className="panel-head">
        <div>
          <h2 id="occurrence-lists-title">
            {copassagem
              ? 'Placas que passaram junto da vítima e perto do local'
              : 'Placas que passaram perto do local'}
          </h2>
          <p>
            As abas mudam a ordem da lista inteira (a lista traz as primeiras
            nessa ordem e todas as com sinal: citada na dinâmica, no Cerco, no
            Disque Denúncia, compatível com um trecho de placa citado, suspeita
            de clone). Os filtros ao lado valem também para o mapa.
          </p>
          <p className="occurrence-warning">
            <AlertTriangle size={13} aria-hidden="true" />
            {data.methodology.warning} Passar junto ou perto não prova presença
            no fato.
          </p>
        </div>
      </div>
      <div className="occurrence-workspace">
        <PlateRail
          data={data}
          filters={filters}
          loading={loading}
          onChange={onFiltersChange}
          choose={choose}
          onReset={onReset}
        />
        <div className="occurrence-workspace-main">
          {copassagem ? (
            <>
              <div
                className="occurrence-tabs"
                role="tablist"
                aria-label="Listas de placas"
                onKeyDown={switchWithArrows}
              >
                {kinds.map((kind) => (
                  <button
                    key={kind}
                    id={`occurrence-tab-${kind}`}
                    type="button"
                    role="tab"
                    aria-selected={tab === kind}
                    aria-controls={`occurrence-tabpanel-${kind}`}
                    tabIndex={tab === kind ? 0 : -1}
                    className={tab === kind ? 'active' : undefined}
                    onClick={() => setTab(kind)}
                  >
                    {TITLES[kind]}
                    <span>
                      {total(kind === 'together' ? data.together : data.nearby)}
                    </span>
                  </button>
                ))}
              </div>
              {kinds.map((kind) => (
                <div
                  key={kind}
                  id={`occurrence-tabpanel-${kind}`}
                  role="tabpanel"
                  aria-labelledby={`occurrence-tab-${kind}`}
                  hidden={tab !== kind}
                >
                  {panels[kind]()}
                </div>
              ))}
            </>
          ) : (
            panels.nearby()
          )}
        </div>
      </div>
    </section>
  )
}
