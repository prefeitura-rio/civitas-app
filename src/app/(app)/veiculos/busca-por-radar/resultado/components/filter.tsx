import { MultiSelectWithSearch } from '@/components/custom/multi-select-with-search'
import { Input } from '@/components/ui/input'
import type { UseSearchByRadarResultDynamicFilter } from '@/hooks/use-search-by-radar-result-dynamic-filter'

interface FilterProps {
  radarIds: string[]
  filters: UseSearchByRadarResultDynamicFilter
}

export function Filter({ radarIds, filters }: FilterProps) {
  const {
    locationOptions,
    selectedLocations,
    selectedPlate,
    selectedRadars,
    setSelectedLocations,
    setSelectedPlate,
    setSelectedRadars,
  } = filters

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Input
        value={selectedPlate}
        onChange={(e) => setSelectedPlate(e.target.value)}
        className="w-44"
        placeholder="Filtrar por placa"
      />
      <div>
        <MultiSelectWithSearch
          options={locationOptions.map((item) => {
            return {
              label: item,
              value: item,
            }
          })}
          onValueChange={(item) => {
            setSelectedLocations(item)
          }}
          defaultValue={selectedLocations}
          placeholder="Selecione uma localidade"
          variant="secondary"
          maxCount={2}
        />
      </div>
      <div>
        <MultiSelectWithSearch
          options={radarIds.map((item) => {
            return {
              label: item,
              value: item,
            }
          })}
          onValueChange={(item) => {
            setSelectedRadars(item)
          }}
          defaultValue={selectedRadars}
          placeholder="Selecione um radar"
          variant="secondary"
          maxCount={2}
        />
      </div>
    </div>
  )
}
