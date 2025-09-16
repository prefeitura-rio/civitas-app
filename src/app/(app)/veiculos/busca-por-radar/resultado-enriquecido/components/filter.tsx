import { MultiSelectWithSearch } from '@/components/custom/multi-select-with-search'
import { Input } from '@/components/ui/input'
import type { UseSearchByRadarEnhancedResultDynamicFilter } from '@/hooks/useSearchByRadarEnhancedResultDynamicFilter'

interface FilterProps {
  radarIds: string[]
  filters: UseSearchByRadarEnhancedResultDynamicFilter
}

export function Filter({ filters, radarIds }: FilterProps) {
  const {
    selectedPlate,
    setSelectedPlate,
    selectedLocations,
    setSelectedLocations,
    selectedColors,
    setSelectedColors,
    selectedBrandModel,
    setSelectedBrandModel,
    locationOptions,
    colorOptions,
    brandModelOptions,
    selectedRadars,
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
          options={colorOptions.map((item) => {
            return {
              label: item,
              value: item,
            }
          })}
          onValueChange={(item) => {
            setSelectedColors(item)
          }}
          defaultValue={selectedColors}
          placeholder="Selecione uma cor"
          variant="secondary"
          maxCount={2}
        />
      </div>
      <div>
        <MultiSelectWithSearch
          options={brandModelOptions.map((item) => {
            return {
              label: item,
              value: item,
            }
          })}
          onValueChange={(item) => {
            setSelectedBrandModel(item)
          }}
          defaultValue={selectedBrandModel} // Corrected default value
          placeholder="Selecione um modelo"
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
