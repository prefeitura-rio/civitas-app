import { ChoicePill } from '@/modules/vehicle-intelligence/components/filters/analysis-filters'
import { FactFilters } from '@/modules/vehicle-intelligence/components/groups/fact-filters'
import { TaxiFilter } from '@/modules/vehicle-intelligence/components/groups/taxi-filter'
import { recorte } from '@/modules/vehicle-intelligence/config/recortes'
import {
  DEFAULT_TERRITORY_FILTERS,
  isDefaultTerritory,
  setTerritoryFilters,
  type TerritoryFilters,
} from '@/modules/vehicle-intelligence/features/territories/api'
import { ITEMS } from '@/modules/vehicle-intelligence/features/territories/vocabulary'
import type { MasterGraphOptions } from '@/modules/vehicle-intelligence/types/domain'

/** Corte e universo do ranking: "500-5" = top 500 das motos com 5+ ocorrências (padrão de transeuntes; o de cada recorte é o primeiro). */
const HIGHLIGHT_OPTIONS = recorte.groups.highlights.map(([cut, minimum]) => ({
  value: `${cut}-${minimum}`,
  label: `Top ${cut} das ${ITEMS} ${minimum}+`,
}))

/** Os filtros da página de territórios: os de fato, o corte "em destaque", os táxis e o "Limpar filtros". */
export function TerritoriesFilters({
  filters,
  options,
}: {
  filters: TerritoryFilters
  options: MasterGraphOptions
}) {
  const set = (patch: Partial<TerritoryFilters>) =>
    setTerritoryFilters((current) => ({ ...current, ...patch }))
  return (
    <section className="groups-filters" aria-label="Filtros dos territórios">
      <FactFilters filters={filters} options={options} onChange={set} />
      <div className="groups-filters-block grouping">
        <span className="groups-filters-title">Placas</span>
        <div className="groups-filters-fields">
          <ChoicePill
            label="Em destaque (Dias de circulação)"
            value={`${filters.destaque}-${filters.rankingMinimo}`}
            items={HIGHLIGHT_OPTIONS}
            onChange={(value) => {
              const [cut, rankingMinimum] = value.split('-').map(Number)
              set({ destaque: cut, rankingMinimo: rankingMinimum })
            }}
          />
          <TaxiFilter
            value={filters.taxis}
            onChange={(taxis) => set({ taxis })}
          />
        </div>
      </div>
      {!isDefaultTerritory(filters) && (
        <button
          type="button"
          className="groups-filters-clear"
          onClick={() => setTerritoryFilters(DEFAULT_TERRITORY_FILTERS)}
        >
          Limpar filtros
        </button>
      )}
    </section>
  )
}
