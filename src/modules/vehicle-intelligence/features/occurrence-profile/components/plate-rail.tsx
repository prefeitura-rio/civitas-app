/**
 * O trilho de filtros da lista de placas do Perfil do RO, ao lado dela, com os controles do trilho do grafo: as janelas
 * (raio e horário; na copassagem, as da vítima) e os filtros de placa (os do grafo e os do fato). A API aplica tudo
 * antes do limite de linhas, então a lista e o mapa mostram as mesmas placas. As citadas no relato ficam fora.
 */
import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'

import { CategoryFilter } from '@/modules/vehicle-intelligence/components/filters/category-filter'
import {
  FilterField,
  SegmentedChoice,
  SelectChoice,
} from '@/modules/vehicle-intelligence/features/correlations'
import {
  activeFilterKeys,
  type PlateFilterChoice,
  type WindowChoice,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/api'
import type {
  DaysBucket,
  OccurrenceAppliedFilters,
  OccurrenceProfileData,
} from '@/modules/vehicle-intelligence/features/occurrence-profile/types'
import {
  formatDistance,
  formatNumber,
} from '@/modules/vehicle-intelligence/lib/format'
import { isMotorcycleType } from '@/modules/vehicle-intelligence/lib/vehicles'

type Found = Extract<OccurrenceProfileData, { found: true }>
type SetFilters = (patch: Partial<PlateFilterChoice>) => void

const CAR_TYPES = ['AUTOMOVEL', 'AUTOMÓVEL']
const MODEL_DELAY_MS = 450
const DAYS_LABELS: Record<DaysBucket, string> = {
  todos: 'Todos',
  ate_3: '≤ 3',
  '4_10': '4–10',
  '11_30': '11–30',
  mais_30: '> 30',
}
const WHEN_CHOICES: Array<[OccurrenceAppliedFilters['when'], string]> = [
  ['qualquer', 'Qualquer momento'],
  ['antes', 'Só antes do fato'],
  ['antes_e_depois', 'Antes e depois do fato'],
  ['depois', 'Só depois do fato'],
]

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="occurrence-rail-group" role="group" aria-label={title}>
      <h3>{title}</h3>
      {children}
    </div>
  )
}

function Field({
  id,
  label,
  help,
  children,
}: {
  id: string
  label: string
  help?: string
  children: ReactNode
}) {
  return (
    <FilterField id={id} label={label} help={help} pending={false}>
      {children}
    </FilterField>
  )
}

/** Os autores, pela dinâmica revisada: "MOTO" sugere o filtro de motos. */
function offenderSuggestion(
  mode: string | null,
  types: string[],
): { text: string; types: string[] } | null {
  const value = (mode ?? '').toUpperCase()
  const motos = types.filter(isMotorcycleType)
  const cars = types.filter((type) => CAR_TYPES.includes(type))
  if (value.includes('MOTO') && motos.length)
    return { text: 'Pela dinâmica, os autores estavam de moto.', types: motos }
  if ((value.includes('CARRO') || value.includes('AUTOM')) && cars.length)
    return { text: 'Pela dinâmica, os autores estavam de carro.', types: cars }
  return null
}

/** Todos, motos, carros ou uma escolha da lista dos tipos (a mesma do grafo). */
function VehicleField({
  types,
  value,
  set,
}: {
  types: string[]
  value: string[]
  set: SetFilters
}) {
  const [choosing, setChoosing] = useState(false)
  const motos = types.filter(isMotorcycleType)
  const cars = types.filter((type) => CAR_TYPES.includes(type))
  const same = (group: string[]) =>
    group.length > 0 &&
    value.length === group.length &&
    group.every((type) => value.includes(type))
  const mode = !value.length
    ? 'all'
    : same(motos)
      ? 'motos'
      : same(cars)
        ? 'cars'
        : 'choose'
  const groups: Record<string, string[]> = { all: [], motos, cars }
  return (
    <Field
      id="occurrence-vehicle"
      label="Veículo da placa"
      help='Tipo da placa encontrada (não o do veículo do fato): o cadastro PRF ou, sem cadastro, o tipo mais lido pelos equipamentos. "Escolher…" abre a lista do grafo.'
    >
      <SegmentedChoice
        id="occurrence-vehicle"
        value={choosing ? 'choose' : mode}
        onChange={(next) => {
          setChoosing(next === 'choose')
          if (next !== 'choose') set({ vehicle_types: groups[next] })
        }}
        choices={[
          ['all', 'Todos'],
          ...(motos.length ? [['motos', 'Motos'] as [string, string]] : []),
          ...(cars.length ? [['cars', 'Carros'] as [string, string]] : []),
          ['choose', 'Escolher…'],
        ]}
      />
      {(choosing || mode === 'choose') && (
        <CategoryFilter
          compact
          label="Tipos de veículo"
          defaultOpen={choosing && !value.length}
          options={types}
          selected={value}
          onChange={(vehicle_types) => set({ vehicle_types })}
        />
      )}
    </Field>
  )
}

/** Modelo ou cor: aplica depois de uma pausa na digitação (ou no Enter), para não pedir o perfil a cada letra. */
function ModelField({ value, set }: { value: string; set: SetFilters }) {
  const [text, setText] = useState(value)
  const committed = useRef(value)
  useEffect(() => {
    // "Padrão" troca o valor por fora.
    if (value !== committed.current) {
      committed.current = value
      setText(value)
    }
  }, [value])
  useEffect(() => {
    if (text.trim() === committed.current.trim()) return
    const timer = window.setTimeout(() => {
      committed.current = text.trim()
      set({ model: text.trim() })
    }, MODEL_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [text, set])
  const commit = (next: string) => {
    committed.current = next.trim()
    setText(next)
    set({ model: next.trim() })
  }
  return (
    <Field
      id="occurrence-model"
      label="Modelo ou cor"
      help='Palavras do modelo ou da cor no cadastro PRF ("gol prata", "cg 160 vermelha"); valem todas. Só as placas com cadastro PRF entram.'
    >
      <span className="occurrence-search-field occurrence-model-field">
        <Search size={14} aria-hidden="true" />
        <input
          id="occurrence-model"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && commit(text)}
          placeholder="gol prata, cg 160…"
          spellCheck={false}
          autoComplete="off"
        />
        {text && (
          <button
            type="button"
            className="occurrence-field-clear"
            aria-label="Apagar modelo ou cor"
            onClick={() => commit('')}
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </span>
    </Field>
  )
}

export function PlateRail({
  data,
  filters,
  loading,
  onChange,
  choose,
  onReset,
}: {
  data: Found
  filters: PlateFilterChoice
  loading: boolean
  onChange: (filters: PlateFilterChoice) => void
  choose: (field: keyof WindowChoice) => (value: number) => void
  onReset: () => void
}) {
  const { options, parameters } = data
  const copassagem = data.strategy === 'copassagem'
  // `set` fica o mesmo entre renders (o campo de modelo o usa num efeito) e sempre parte dos filtros atuais.
  const latest = useRef({ filters, onChange })
  latest.current = { filters, onChange }
  const set = useRef<SetFilters>((patch) =>
    latest.current.onChange({ ...latest.current.filters, ...patch }),
  ).current
  const active = activeFilterKeys(filters).length
  const suggestion = filters.vehicle_types.length
    ? null
    : offenderSuggestion(data.occurrence.offender_mode, options.vehicle_types)
  const minutes = (values: number[]) =>
    values.map((value) => [value, `±${value}`] as [number, string])
  const windowsChanged =
    (copassagem &&
      (parameters.event_window_minutes !== options.default_event_window ||
        parameters.passage_window_minutes !==
          options.default_passage_window)) ||
    parameters.radius_meters !== options.default_radius ||
    parameters.near_window_minutes !== options.default_near_window

  return (
    <aside
      className="occurrence-rail"
      aria-label="Filtros da lista de placas"
      aria-busy={loading}
    >
      <div className="occurrence-rail-heading">
        <SlidersHorizontal size={17} aria-hidden="true" />
        <strong>Filtros</strong>
        <span
          className="occurrence-rail-status"
          role="status"
          aria-live="polite"
        >
          {loading
            ? 'Atualizando…'
            : active
              ? `${formatNumber(active)} ${active === 1 ? 'ativo' : 'ativos'}`
              : ''}
        </span>
        {(active > 0 || windowsChanged) && (
          <button
            type="button"
            className="graph-filter-reset"
            onClick={onReset}
          >
            <RotateCcw size={13} aria-hidden="true" />
            Padrão
          </button>
        )}
      </div>

      <Group title="Janelas">
        {copassagem &&
          options.event_windows.length > 0 &&
          parameters.event_window_minutes != null && (
            <Field
              id="occurrence-event-window"
              label="Vítima até o fato (min)"
              help="Passagens da placa vítima até este intervalo do fato: com elas, a lista de quem passou junto."
            >
              <SegmentedChoice
                id="occurrence-event-window"
                value={parameters.event_window_minutes}
                onChange={choose('event_window_minutes')}
                choices={minutes(options.event_windows)}
              />
            </Field>
          )}
        {copassagem &&
          options.passage_windows.length > 0 &&
          parameters.passage_window_minutes != null && (
            <Field
              id="occurrence-passage-window"
              label="Entre passagens (min)"
              help="Intervalo máximo entre a placa e a vítima no mesmo ponto de coleta."
            >
              <SegmentedChoice
                id="occurrence-passage-window"
                value={parameters.passage_window_minutes}
                onChange={choose('passage_window_minutes')}
                choices={minutes(options.passage_windows)}
              />
            </Field>
          )}
        <Field
          id="occurrence-radius"
          label="Raio do local"
          help={data.methodology.windows_note}
        >
          <SegmentedChoice
            id="occurrence-radius"
            value={parameters.radius_meters}
            onChange={choose('radius_meters')}
            choices={options.radii.map(
              (value) => [value, formatDistance(value)] as [number, string],
            )}
          />
        </Field>
        <Field
          id="occurrence-near-window"
          label="Em volta do horário (min)"
          help="Leituras perto do local até este intervalo do horário do fato."
        >
          <SegmentedChoice
            id="occurrence-near-window"
            value={parameters.near_window_minutes}
            onChange={choose('near_window_minutes')}
            choices={minutes(options.near_windows)}
          />
        </Field>
      </Group>

      <Group title="Placa">
        {options.vehicle_types.length > 0 && (
          <VehicleField
            types={options.vehicle_types}
            value={filters.vehicle_types}
            set={set}
          />
        )}
        {suggestion && (
          <p className="occurrence-rail-hint">
            {suggestion.text}{' '}
            <button
              type="button"
              className="occurrence-more"
              onClick={() => set({ vehicle_types: suggestion.types })}
            >
              Ver só{' '}
              {suggestion.types.some(isMotorcycleType) ? 'motos' : 'carros'}
            </button>
          </p>
        )}
        <ModelField value={filters.model} set={set} />
        <Field
          id="occurrence-taxis"
          label="Táxis ativos"
          help={
            options.active_taxis.available
              ? `Compara com ${formatNumber(options.active_taxis.count)} placas de táxis ativos.`
              : 'O cadastro de táxis ativos está indisponível nesta base.'
          }
        >
          <SegmentedChoice
            id="occurrence-taxis"
            value={filters.taxis}
            disabled={!options.active_taxis.available}
            onChange={(taxis) => set({ taxis })}
            choices={[
              ['todos', 'Incluir'],
              ['somente_taxis', 'Só táxis'],
              ['excluir_taxis', 'Excluir'],
            ]}
          />
        </Field>
        <Field
          id="occurrence-denuncias"
          label="Disque Denúncia"
          help='Placas citadas numa denúncia do Disque Denúncia (com "PLACA" antes no relato; desde 2019). A denúncia é anônima e não verificada.'
        >
          <SegmentedChoice
            id="occurrence-denuncias"
            value={filters.denuncias}
            onChange={(denuncias) => set({ denuncias })}
            choices={[
              ['todos', 'Incluir'],
              ['somente_citadas', 'Só citadas'],
              ['excluir_citadas', 'Excluir'],
            ]}
          />
        </Field>
        <Field
          id="occurrence-plate-type"
          label="Situação da placa"
          help={
            copassagem
              ? 'Suspeita de clone, também vítima em outro RO do recorte, ou sem esses alertas.'
              : 'Suspeita de clone ou sem esse alerta.'
          }
        >
          <SelectChoice
            id="occurrence-plate-type"
            value={filters.plate_type}
            onChange={(plate_type) => set({ plate_type })}
            choices={[
              ['todas', 'Qualquer situação'],
              ['clones', 'Suspeita de clone'],
              ...(copassagem
                ? [
                    ['tambem_roubadas', 'Também vítima'] as [
                      typeof filters.plate_type,
                      string,
                    ],
                  ]
                : []),
              ['comuns', 'Sem alerta'],
            ]}
          />
        </Field>
      </Group>

      <Group title="Perto do fato">
        <Field
          id="occurrence-when"
          label="Quando passou"
          help="Pela primeira e pela última leitura da placa na lista, em relação ao horário do fato. Só antes: chegou e saiu antes; antes e depois: estava lá no horário."
        >
          <SelectChoice
            id="occurrence-when"
            value={filters.when}
            onChange={(when) => set({ when })}
            choices={WHEN_CHOICES}
          />
        </Field>
        <Field
          id="occurrence-min-readings"
          label="Leituras (mín.)"
          help="Leituras da placa na lista: no raio e na janela (perto) ou nas passagens junto da vítima (junto)."
        >
          <SegmentedChoice
            id="occurrence-min-readings"
            value={filters.min_readings}
            onChange={(min_readings) => set({ min_readings })}
            choices={options.min_readings.map(
              (value) => [value, String(value)] as [number, string],
            )}
          />
        </Field>
        <Field
          id="occurrence-min-detections"
          label="Detecções da placa (mín.)"
          help="Detecções da placa em todo o período. Uma placa lida 1 vez, justo perto do fato, tem cobertura de 100% (1 de 1): quase sempre é erro de leitura ou coincidência."
        >
          <SegmentedChoice
            id="occurrence-min-detections"
            value={filters.min_detections}
            onChange={(min_detections) => set({ min_detections })}
            choices={(options.min_detections ?? [1, 3, 5, 10, 20]).map(
              (value) =>
                [value, value === 1 ? 'Todas' : `${value}+`] as [
                  number,
                  string,
                ],
            )}
          />
        </Field>
        <Field
          id="occurrence-min-strength"
          label="Força (mín.)"
          help={data.methodology.strength}
        >
          <SegmentedChoice
            id="occurrence-min-strength"
            value={filters.min_strength ?? 0}
            onChange={(next) => set({ min_strength: next || null })}
            choices={[
              [0, 'Qualquer'],
              ...options.min_strengths.map(
                (value) => [value, `≥ ${value}`] as [number, string],
              ),
            ]}
          />
        </Field>
      </Group>

      <Group title="Histórico da placa">
        <Field
          id="occurrence-min-links"
          label="Correlações (mín.)"
          help={`Em quantos ROs do recorte a placa aparece no grafo, nestas janelas (${copassagem ? 'junto de uma vítima' : 'perto do local'}); conta este RO. Muitas costumam ser trânsito comum do lugar.`}
        >
          <SegmentedChoice
            id="occurrence-min-links"
            value={filters.min_links}
            onChange={(min_links) => set({ min_links })}
            choices={options.min_links.map(
              (value) =>
                [value, value === 1 ? 'Qualquer' : String(value)] as [
                  number,
                  string,
                ],
            )}
          />
        </Field>
        <Field
          id="occurrence-days"
          label="Dias com leitura"
          help={`Dias em que a placa foi lida no período das detecções. Poucos dias: quase não circula por aqui; muitos: circula sempre.`}
        >
          <SegmentedChoice
            id="occurrence-days"
            value={filters.days}
            onChange={(days) => set({ days })}
            choices={options.days.map(
              (value) => [value, DAYS_LABELS[value]] as [DaysBucket, string],
            )}
          />
        </Field>
        {options.activity.available && (
          <Field
            id="occurrence-activity"
            label="Detectada nos últimos"
            help="Placas lidas nos últimos dias antes da data de referência da base: ainda circulam."
          >
            <SegmentedChoice
              id="occurrence-activity"
              value={filters.activity_days ?? 0}
              onChange={(next) => set({ activity_days: next || null })}
              choices={[
                [0, 'Qualquer'],
                ...options.activity.windows.map(
                  (days) => [days, `${days} d`] as [number, string],
                ),
              ]}
            />
          </Field>
        )}
      </Group>
    </aside>
  )
}
