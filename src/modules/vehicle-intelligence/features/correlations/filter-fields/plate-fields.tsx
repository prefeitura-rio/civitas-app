/** Filtros de placa do trilho (aba Placas) e o limite de placas desenhadas. */
import { RangeSlider } from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail/range-slider'
import { SegmentedChoice } from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail/segmented-choice'
import { SelectChoice } from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail/select-choice'
import { VehicleChoice } from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail/vehicle-choice'
import type { FilterFieldDef } from '@/modules/vehicle-intelligence/features/correlations/filter-fields/field-types'
import type { GraphQuery } from '@/modules/vehicle-intelligence/features/correlations/query'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

export const vehicle: FilterFieldDef = {
  key: 'veiculos',
  id: 'graph-vehicle',
  label: 'Veículo da placa',
  help: 'Tipo da placa encontrada (não o do veículo do fato): o cadastro PRF ou, sem cadastro, o tipo mais lido pelos equipamentos, identificado como não PRF. "Só motos" inclui esses dois grupos.',
  hidden: ({ options }) => !options?.veiculos?.length,
  render: (ctx) => <VehicleChoice {...ctx} listLabel="Tipos de veículo" />,
}

export const taxi: FilterFieldDef = {
  key: 'taxiFilter',
  id: 'graph-taxi',
  label: 'Táxis ativos',
  help: ({ options }) =>
    options?.active_taxis.available
      ? `Compara com ${formatNumber(options.active_taxis.count)} placas de táxis ativos.`
      : 'O cadastro de táxis ativos está indisponível nesta base.',
  render: ({ id, query, set, options }) => (
    <SegmentedChoice
      id={id}
      value={query.taxiFilter}
      disabled={!options?.active_taxis.available}
      onChange={(taxiFilter) => set({ taxiFilter })}
      choices={[
        ['todos', 'Incluir'],
        ['somente_taxis', 'Só táxis'],
        ['excluir_taxis', 'Excluir'],
      ]}
    />
  ),
}

export const denuncia: FilterFieldDef = {
  key: 'denunciaFilter',
  id: 'graph-denuncia',
  label: 'Disque Denúncia',
  help: 'Placas citadas numa denúncia do Disque Denúncia (com "PLACA" antes no relato; desde 2019). A denúncia é anônima e não verificada.',
  render: ({ id, query, set }) => (
    <SegmentedChoice
      id={id}
      value={query.denunciaFilter}
      onChange={(denunciaFilter) => set({ denunciaFilter })}
      choices={[
        ['todos', 'Incluir'],
        ['somente_citadas', 'Só citadas'],
        ['excluir_citadas', 'Excluir'],
      ]}
    />
  ),
}

/** Clone e (copassagem) placa que também foi vítima no recorte. */
export const plateSituation = (alsoVictim?: string): FilterFieldDef => ({
  key: 'plateType',
  id: 'graph-plate-type',
  label: 'Situação da placa',
  help: alsoVictim
    ? `Separa placas com alerta de clonagem, ${alsoVictim.toLowerCase()} ou sem esses alertas.`
    : 'Separa placas com alerta de clonagem das placas sem esse alerta.',
  render: ({ id, query, set }) => (
    <SelectChoice
      id={id}
      value={query.plateType}
      onChange={(plateType) => set({ plateType })}
      choices={
        [
          ['todas', 'Qualquer situação'],
          ['clones', 'Suspeita de clonagem'],
          ...(alsoVictim
            ? [['tambem_roubadas', alsoVictim] as [string, string]]
            : []),
          ['comuns', 'Sem alerta'],
        ] as Array<[GraphQuery['plateType'], string]>
      }
    />
  ),
})

export const minPlateDetections: FilterFieldDef = {
  key: 'minPlateDetections',
  id: 'graph-min-plate-detections',
  label: 'Detecções da placa (mín.)',
  help: 'Quantidade mínima de detecções da placa em todo o período. Uma placa lida 1 vez, justo perto de um fato, tem cobertura de 100% (1 de 1): quase sempre é erro de leitura ou coincidência.',
  render: ({ id, query, set }) => (
    <SegmentedChoice
      id={id}
      value={query.minPlateDetections}
      onChange={(minPlateDetections) => set({ minPlateDetections })}
      choices={[1, 3, 5, 10, 20].map((value) => [
        value,
        value === 1 ? 'Todas' : `${value}+`,
      ])}
    />
  ),
}

export const minEvents: FilterFieldDef = {
  key: 'minEvents',
  id: 'graph-min-events',
  label: 'Ocorrências ligadas (mín.)',
  help: 'Quantidade mínima de ocorrências distintas ligadas à placa. Num corredor movimentado, milhares de placas passam perto de uma única ocorrência.',
  render: ({ id, query, set }) => (
    <RangeSlider
      id={id}
      value={query.minEvents}
      min={1}
      max={20}
      onChange={(minEvents) => set({ minEvents })}
    />
  ),
}

export const minVictims = (help: string): FilterFieldDef => ({
  key: 'minVictims',
  id: 'graph-min-victims',
  label: 'Vítimas ligadas (mín.)',
  help,
  render: ({ id, query, set }) => (
    <RangeSlider
      id={id}
      value={query.minVictims}
      min={1}
      max={10}
      onChange={(minVictims) => set({ minVictims })}
    />
  ),
})

export const proximity: FilterFieldDef = {
  key: 'minTemperature',
  id: 'graph-proximity',
  label: 'Proximidade (mín.)',
  help: 'Índice de 0 a 100 que combina proximidade no tempo e no espaço; quanto maior, mais próxima a relação.',
  render: ({ id, query, set }) => (
    <SegmentedChoice
      id={id}
      value={query.minTemperature}
      onChange={(minTemperature) => set({ minTemperature })}
      choices={[
        [0, 'Qualquer'],
        [40, '≥ 40'],
        [70, '≥ 70'],
      ]}
    />
  ),
}

export const activity: FilterFieldDef = {
  key: 'activityDays',
  id: 'graph-activity',
  label: 'Detectada nos últimos',
  help: ({ activityHelp }) => activityHelp,
  render: ({ id, query, set }) => (
    <SegmentedChoice
      id={id}
      value={query.activityDays}
      onChange={(activityDays) => set({ activityDays })}
      choices={[
        [0, 'Qualquer'],
        [7, '7 d'],
        [15, '15 d'],
        [30, '30 d'],
        [45, '45 d'],
      ]}
    />
  ),
}

export const graphLimitField: FilterFieldDef = {
  key: 'graphLimit',
  id: 'graph-limit',
  label: 'Placas no grafo',
  help: 'O limite é preenchido depois de todos os filtros: quando uma placa sai, a próxima válida entra. O ranking continua considerando todo o resultado.',
  render: ({ id, query, set }) => (
    <SegmentedChoice
      id={id}
      value={query.graphLimit}
      onChange={(graphLimit) => set({ graphLimit })}
      choices={[
        [250, '250'],
        [500, '500'],
        [1000, '1.000'],
      ]}
    />
  ),
}
