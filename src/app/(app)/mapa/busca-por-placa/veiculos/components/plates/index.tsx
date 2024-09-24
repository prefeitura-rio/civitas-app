import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useMap } from '@/hooks/use-contexts/use-map-context'
import { getBulkPlatesInfo } from '@/http/cars/plate/get-plate-info-bulk'

import { PlatesTable } from './components/plates-table'

export function PlateList() {
  const {
    layers: {
      trips: { possiblePlates, lastSearchParams },
    },
  } = useMap()
  if (!possiblePlates || !lastSearchParams) return null

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['cortex', 'plate-info', ...possiblePlates],
    queryFn: () => getBulkPlatesInfo(possiblePlates),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: possiblePlates.length > 0,
  })

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
      <div className="mb-4 h-[calc(100%-4.75rem)] space-y-2 overflow-y-scroll rounded p-2">
        {possiblePlates.length > 0 ? (
          <PlatesTable data={vehicles} isLoading={isLoading} />
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
