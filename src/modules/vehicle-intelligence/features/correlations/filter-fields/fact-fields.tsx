/** Filtros de fato do trilho (aba Fatos): período, tipo, alvo, autor, CISP, janelas, raio e distância. */
import { CispFilter } from '@/modules/vehicle-intelligence/components/filters/analysis-filters'
import { ChipChoices } from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail/chip-choices'
import { SegmentedChoice } from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail/segmented-choice'
import { SelectChoice } from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail/select-choice'
import type { FilterFieldDef } from '@/modules/vehicle-intelligence/features/correlations/filter-fields/field-types'
import {
  formatDistance,
  formatNumber,
} from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import { periodChoices } from '@/modules/vehicle-intelligence/lib/period'
import {
  allowed,
  DEFAULT_EVENT_SCOPE,
  SCOPE_LIMITS,
} from '@/modules/vehicle-intelligence/stores/event-scope'
import {
  cispsOfZones,
  type CrimeType,
  type MasterGraphOptions,
  zonesIn,
} from '@/modules/vehicle-intelligence/types/domain'

const minutes = (values: number[]) =>
  values.map((value): [number, string] => [value, `±${value} min`])
const cispOptions = (options: MasterGraphOptions | null) =>
  (options?.cisps ?? []).map((code) => ({
    codigo: code,
    nome: options?.cisp_names?.[code] || `CISP ${code} - nome não disponível`,
    total: 0,
  }))

export const period: FilterFieldDef = {
  key: 'months',
  id: 'graph-period',
  label: 'Período',
  help: 'Contado a partir do fato mais recente da base. Vale para o grafo, o ranking, o perfil e a timeline das placas.',
  render: ({ id, query, set, options }) => (
    <SegmentedChoice
      id={id}
      value={query.months ?? 0}
      onChange={(months) => set({ months: months || null })}
      choices={periodChoices(options?.available_period_months).map((value) => [
        value ?? 0,
        value ? `${value} ${value === 1 ? 'mês' : 'meses'}` : 'Tudo',
      ])}
    />
  ),
}

export const modality = (label: string, help?: string): FilterFieldDef => ({
  key: 'modalidades',
  id: 'graph-crime',
  label,
  help,
  render: ({ id, query, set, options }) => (
    <SegmentedChoice
      id={id}
      value={query.modalidades.length === 1 ? query.modalidades[0] : 'TODOS'}
      onChange={(value) =>
        set({
          modalidades:
            value === 'TODOS'
              ? DEFAULT_EVENT_SCOPE.modalidades
              : [value as CrimeType],
        })
      }
      choices={[
        ['TODOS', 'Todos'],
        ...(options?.modalidades ?? DEFAULT_EVENT_SCOPE.modalidades).map(
          (value): [string, string] => [value, categoryLabel(value)],
        ),
      ]}
    />
  ),
})

export const cargoOnly: FilterFieldDef = {
  key: 'somenteCarga',
  id: 'graph-cargo',
  label: 'Natureza',
  hidden: ({ options }) => !options?.cargo?.available,
  help: ({ options }) =>
    `${formatNumber(options?.cargo?.events)} eventos ligados a ${formatNumber(options?.cargo?.occurrences)} ROs de roubo de carga (ISP + GERENCIALWEB).`,
  render: ({ id, query, set }) => (
    <SegmentedChoice
      id={id}
      value={query.somenteCarga ? 'carga' : 'todas'}
      onChange={(value) => set({ somenteCarga: value === 'carga' })}
      choices={[
        ['todas', 'Todas'],
        ['carga', 'Roubo de carga'],
      ]}
    />
  ),
}

export const targets = (
  label: string,
  help: string,
  fixed: string[] = [],
): FilterFieldDef => ({
  key: 'alvos',
  id: 'graph-target',
  label,
  help,
  render: ({ id, query, set, options }) => (
    <ChipChoices
      id={id}
      options={[...new Set([...fixed, ...(options?.alvos ?? [])])]}
      selected={query.alvos}
      onChange={(selected) => set({ alvos: selected })}
      labelFor={categoryLabel}
    />
  ),
})

export const offender: FilterFieldDef = {
  key: 'deslocamentos',
  id: 'graph-offender',
  label: 'Autor em',
  help: 'Deslocamento do autor, anotado pelo analista na dinâmica do fato. Só moto e carro têm placa a procurar.',
  hidden: ({ options }) => !(options?.deslocamentos ?? []).some(Boolean),
  render: ({ id, query, set, options }) => (
    <ChipChoices
      id={id}
      selected={query.deslocamentos}
      onChange={(selected) => set({ deslocamentos: selected })}
      labelFor={categoryLabel}
      options={[
        ...new Set([
          'MOTO',
          'CARRO',
          'BICICLETA',
          'A PÉ',
          'NÃO INFORMADO',
          ...(options?.deslocamentos ?? []),
        ]),
      ]}
    />
  ),
}

export const zone: FilterFieldDef = {
  key: 'cisps',
  id: 'graph-zone',
  label: 'Zona',
  help: 'As CISPs de cada zona da cidade (pelas áreas de planejamento): escolher uma zona marca as CISPs dela. Sem zona, a cidade inteira.',
  hidden: ({ options }) => !(options?.zones ?? []).length,
  render: ({ id, query, set, options }) => (
    <ChipChoices
      id={id}
      selected={zonesIn(options?.zones, query.cisps)}
      onChange={(names) => set({ cisps: cispsOfZones(options?.zones, names) })}
      labelFor={(name) => name}
      options={(options?.zones ?? []).map((item) => item.name)}
    />
  ),
}

export const cisp: FilterFieldDef = {
  key: 'cisps',
  id: 'graph-cisp',
  label: 'CISP',
  render: ({ query, set, options }) => (
    <CispFilter
      options={cispOptions(options)}
      selected={query.cisps}
      onChange={(cisps) => set({ cisps })}
    />
  ),
}

export const eventWindow = (label: string, help: string): FilterFieldDef => ({
  key: 'eventWindow',
  id: 'graph-window',
  label,
  help,
  render: ({ id, query, set, options }) => (
    <SegmentedChoice
      id={id}
      value={query.eventWindow}
      onChange={(eventWindow) => set({ eventWindow })}
      choices={minutes(
        allowed(
          options?.available_event_window_minutes,
          SCOPE_LIMITS.eventWindows,
        ),
      )}
    />
  ),
})

export const radius: FilterFieldDef = {
  key: 'radius',
  id: 'graph-radius',
  label: 'Raio',
  help: 'Distância máxima entre o fato e o equipamento. Grafo e ranking usam este raio; o limite de placas desenhadas não restringe o ranking.',
  render: ({ id, query, set, options }) => (
    <SegmentedChoice
      id={id}
      value={query.radius}
      onChange={(radius) => set({ radius })}
      choices={allowed(
        options?.available_radius_meters,
        SCOPE_LIMITS.radii,
      ).map((value) => [value, formatDistance(value)])}
    />
  ),
}

export const passageWindow: FilterFieldDef = {
  key: 'passageWindow',
  id: 'graph-passage',
  label: 'Janela entre passagens',
  help: 'Intervalo máximo entre a passagem da vítima e a passagem da correlata no mesmo radar.',
  render: ({ id, query, set, options }) => (
    <SegmentedChoice
      id={id}
      value={query.passageWindow}
      onChange={(passageWindow) => set({ passageWindow })}
      choices={minutes(
        allowed(
          options?.available_passage_window_minutes,
          SCOPE_LIMITS.passageWindows,
        ),
      )}
    />
  ),
}

export const factDistance = (help: string): FilterFieldDef => ({
  key: 'maxFactDistance',
  id: 'graph-fact-distance',
  label: 'Distância do radar ao fato',
  help,
  render: ({ id, query, set }) => (
    <SelectChoice
      id={id}
      value={query.maxFactDistance}
      onChange={(maxFactDistance) => set({ maxFactDistance })}
      choices={[
        [0, 'Qualquer distância'],
        [100, 'Até 100 m'],
        [250, 'Até 250 m'],
        [500, 'Até 500 m'],
        [1000, 'Até 1 km'],
        [3000, 'Até 3 km'],
        [5000, 'Até 5 km'],
        [10000, 'Até 10 km'],
      ]}
    />
  ),
})
