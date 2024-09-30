import { Input } from '@/components/ui/input'
import type { UseSearchByPlateResultDynamicFilter } from '@/hooks/use-search-by-plate-result-dynamic-filter'

interface FilterProps {
  filters: UseSearchByPlateResultDynamicFilter
}

export function Filter({ filters }: FilterProps) {
  const { selectedPlate, setSelectedPlate } = filters

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Input
        value={selectedPlate}
        onChange={(e) => setSelectedPlate(e.target.value)}
        className="w-44"
        placeholder="Filtrar por placa"
      />
    </div>
  )
}
