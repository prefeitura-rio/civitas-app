import { type KeyboardEvent, type ReactElement, useState } from 'react'

import { Segments } from '@/modules/vehicle-intelligence/components/groups/controls'
import type { WindowChoice } from '@/modules/vehicle-intelligence/features/occurrence-profile/api'
import { PlatesPanel } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/plates-panel'
import type { PlatesKind } from '@/modules/vehicle-intelligence/features/occurrence-profile/components/plates-table'
import { distanceLabel } from '@/modules/vehicle-intelligence/features/occurrence-profile/occurrence-format'
import type {
  OccurrencePlateList,
  OccurrenceProfileData,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

type Found = Extract<OccurrenceProfileData, { found: true }>
type Choose = (field: keyof WindowChoice) => (value: number) => void

/** Um seletor de janela (minutos ou metros) com as opções da API. */
function WindowSegments({
  label,
  unit,
  options,
  value,
  onChange,
}: {
  label: string
  unit: 'min' | 'm'
  options: number[]
  value: number | null
  onChange: (value: number) => void
}) {
  if (!options.length || value == null) return null
  return (
    <div className="occurrence-window">
      <span>{label}</span>
      <Segments
        label={label}
        value={String(value)}
        onChange={(next) => onChange(Number(next))}
        options={options.map((option) => ({
          value: String(option),
          label: unit === 'm' ? distanceLabel(option) : `±${option} min`,
        }))}
      />
    </div>
  )
}

const TITLES: Record<PlatesKind, string> = {
  together: 'Passaram junto com a vítima',
  nearby: 'Passaram perto do local',
}

const total = (list: OccurrencePlateList | null) =>
  list?.available ? formatNumber(list.total) : '—'

/** As listas completas: em veículos e carga, abas Junto | Perto; em transeuntes, só a de perto do local. */
export function PlateLists({
  data,
  loading,
  choose,
  onOpenPlate,
}: {
  data: Found
  loading: boolean
  choose: Choose
  onOpenPlate: (plate: string) => void
}) {
  const { options, parameters } = data
  const copassagem = data.strategy === 'copassagem'
  // Sem placa junto da vítima e com placas perto, a aba de perto abre primeiro.
  const [tab, setTab] = useState<PlatesKind>(() =>
    copassagem &&
    !(
      data.together?.available &&
      !data.together.total &&
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
        heading={!copassagem}
        description={`Placas lidas no mesmo ponto que a placa vítima até ±${parameters.passage_window_minutes} min dela, nas passagens da vítima até ±${parameters.event_window_minutes} min do fato: as ligações do grafo de correlatas.`}
        emptyText="Nenhuma placa passou junto da vítima nestas janelas. Sem passagem da vítima perto do horário do fato, não há com quem comparar."
        controls={
          <>
            <WindowSegments
              label="Vítima até o fato"
              unit="min"
              options={options.event_windows}
              value={parameters.event_window_minutes}
              onChange={choose('event_window_minutes')}
            />
            <WindowSegments
              label="Entre passagens"
              unit="min"
              options={options.passage_windows}
              value={parameters.passage_window_minutes}
              onChange={choose('passage_window_minutes')}
            />
          </>
        }
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
        heading={!copassagem}
        description={`Placas lidas nos pontos de coleta até ${distanceLabel(parameters.radius_meters)} do local do fato, até ±${parameters.near_window_minutes} min do horário.${nearbyPoints != null ? ` ${formatNumber(nearbyPoints)} ${nearbyPoints === 1 ? 'ponto de coleta' : 'pontos de coleta'} no raio.` : ''}`}
        note={data.methodology.windows_note}
        emptyText={
          nearbyPoints === 0
            ? 'Não há ponto de coleta neste raio: a lista vazia não diz quem passou ali.'
            : 'Nenhuma placa foi lida neste raio e nesta janela.'
        }
        controls={
          <>
            <WindowSegments
              label="Raio do local"
              unit="m"
              options={options.radii}
              value={parameters.radius_meters}
              onChange={choose('radius_meters')}
            />
            <WindowSegments
              label="Em volta do horário"
              unit="min"
              options={options.near_windows}
              value={parameters.near_window_minutes}
              onChange={choose('near_window_minutes')}
            />
          </>
        }
        onOpenPlate={onOpenPlate}
      />
    ),
  }

  if (!copassagem)
    return (
      <section className="groups-panel occurrence-lists">
        {panels.nearby()}
      </section>
    )
  return (
    <section
      className="groups-panel occurrence-lists"
      aria-label="Listas de placas"
    >
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
    </section>
  )
}
