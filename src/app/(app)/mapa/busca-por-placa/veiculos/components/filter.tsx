import { MultiSelectWithSearch } from '@/components/custom/multi-select-with-search'
import { Input } from '@/components/ui/input'
import type { UseSearchByPlateEnhancedResultDynamicFilter } from '@/hooks/use-search-by-plate-enhanced-result-dynamic-filter'

interface FilterProps {
  filters: UseSearchByPlateEnhancedResultDynamicFilter
}

export function Filter({ filters }: FilterProps) {
  const {
    selectedPlate,
    setSelectedPlate,
    colorOptions,
    selectedColors,
    setSelectedColors,
    brandModelOptions,
    selectedBrandModel,
    setSelectedBrandModel,
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
          defaultValue={selectedBrandModel}
          placeholder="Selecione um modelo"
          variant="secondary"
          maxCount={2}
        />
      </div>
    </div>
  )
}
