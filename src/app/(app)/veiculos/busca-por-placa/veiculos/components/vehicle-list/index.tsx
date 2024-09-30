import type { Vehicle } from '@/models/entities'

import { VehicleTable } from './components/vehicle-table'

interface VehicleListProps {
  isLoading: boolean
  data: Vehicle[]
}
export function VehicleList({ data, isLoading }: VehicleListProps) {
  return (
    <div className="mb-4 h-full space-y-2 overflow-y-scroll rounded">
      {data.length > 0 ? (
        <VehicleTable data={data} isLoading={isLoading} />
      ) : (
        <div className="flex h-full w-full justify-center pt-6">
          <span className="text-muted-foreground">
            Nenhum veículo encontrado.
          </span>
        </div>
      )}
    </div>
  )
}
