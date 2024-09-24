import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useVehicles } from '@/hooks/use-queries/use-vehicles'

import { VehicleTable } from './components/vehicle-table'

export function VehicleList() {
  const {
    layers: {
      trips: { possiblePlates, lastSearchParams },
    },
  } = useMap()
  if (!possiblePlates || !lastSearchParams) return null

  const { data: vehicles, isLoading } = useVehicles(possiblePlates)

  return (
    <div className="h-full space-y-2">
      <div className="text-center">
        <h4 className="">
          Resultado para{' '}
          <span className="code-highlight">{lastSearchParams.plate}</span>
        </h4>
        <span className="text-sm text-muted-foreground">
          {`${format(lastSearchParams.startTime, 'dd MMM, y HH:mm', { locale: ptBR })} - ${format(lastSearchParams.endTime, 'dd MMM, y HH:mm', { locale: ptBR })}`}
        </span>
      </div>
      <div className="mb-4 h-full space-y-2 overflow-y-scroll rounded">
        {possiblePlates.length > 0 ? (
          <VehicleTable data={vehicles} isLoading={isLoading} />
        ) : (
          <div className="flex h-full w-full justify-center pt-6">
            <span className="text-muted-foreground">
              Nenhum veículo encontrado.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
