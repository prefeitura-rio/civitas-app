import { ChoicePill } from '@/modules/vehicle-intelligence/components/filters/analysis-filters'
import { FactFilters } from '@/modules/vehicle-intelligence/components/groups/fact-filters'
import { TaxiFilter } from '@/modules/vehicle-intelligence/components/groups/taxi-filter'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import {
  DEFAULT_GROUP_FILTERS,
  type GroupFilters,
  isDefault,
  setGroupFilters,
} from '@/modules/vehicle-intelligence/features/groups/api'
import type { MasterGraphOptions } from '@/modules/vehicle-intelligence/types/domain'

const SEED_OPTIONS = [100, 200, 300, 500].map((value) => ({
  value: String(value),
  label: `Top ${value}`,
}))
const MINIMUM_OPTIONS = recorte.groups.minimumOptions.map((value) => ({
  value: String(value),
  label: `${value}+ ocorrências`,
}))

/** Os filtros da página de grupos: os de fato, os do agrupamento e o "Limpar filtros". */
export function GroupsFilters({
  filters,
  options,
}: {
  filters: GroupFilters
  options: MasterGraphOptions
}) {
  const set = (patch: Partial<GroupFilters>) =>
    setGroupFilters((current) => ({ ...current, ...patch }))
  return (
    <section className="groups-filters" aria-label="Filtros dos grupos">
      <FactFilters filters={filters} options={options} onChange={set} />
      <div className="groups-filters-block grouping">
        <span className="groups-filters-title">Agrupamento</span>
        <div className="groups-filters-fields">
          <ChoicePill
            label="Sementes"
            value={String(filters.sementes)}
            items={SEED_OPTIONS}
            onChange={(value) => set({ sementes: Number(value) })}
          />
          <ChoicePill
            label="Mínimo da semente"
            value={String(filters.minimoSementes)}
            items={MINIMUM_OPTIONS}
            onChange={(value) => set({ minimoSementes: Number(value) })}
          />
          <ChoicePill
            label="Ligação"
            value={filters.criterio}
            items={recorte.groups.linkRules.map(([value, label]) => ({
              value,
              label,
            }))}
            onChange={(value) =>
              set({ criterio: value as GroupFilters['criterio'] })
            }
          />
          <TaxiFilter
            value={filters.taxis}
            onChange={(taxis) => set({ taxis })}
          />
        </div>
      </div>
      {!isDefault(filters) && (
        <button
          type="button"
          className="groups-filters-clear"
          onClick={() => setGroupFilters(DEFAULT_GROUP_FILTERS)}
        >
          Limpar filtros
        </button>
      )}
    </section>
  )
}
