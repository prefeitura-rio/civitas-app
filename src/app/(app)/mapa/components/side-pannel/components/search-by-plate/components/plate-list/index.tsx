import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Car } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useVehicles } from '@/hooks/use-queries/use-vehicles'
import { useState } from 'react'

export function PlateList() {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const {
    layers: {
      trips: { possiblePlates, getTrips, lastSearchParams },
    },
  } = useMap()
  if (!possiblePlates || !lastSearchParams) return null

  async function handlePlateClick(plate: string) {
    if (!lastSearchParams) return
    await getTrips({
      plate,
      startTime: lastSearchParams?.startTime,
      endTime: lastSearchParams?.endTime,
    })
  }

  const { data: vehicles } = useVehicles({ possiblePlates, progress: (i) => setLoadingProgress(i) })

  return (
    <div className="h-[calc(100%-15rem)] space-y-2">
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

        {
          vehicles ? (
            vehicles?.map((item) => (
              <Card
                onClick={() => handlePlateClick(item.plate)}
                className="flex cursor-pointer flex-col rounded-md border-2 p-4"
              >
                <div className="mb-2 flex w-full items-center justify-between">
                  <span>{`${item.brandModel}`}</span>
                  <code className="code-highlight">{item.plate}</code>
                </div>
                <div className="grid grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Car className="size-4 shrink-0" />
                    <span>{item.color.capitalizeFirstLetter()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 shrink-0" />
                    <span>{item.modelYear}</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div>
              <span className='text-muted-foreground'>Carregando... {(loadingProgress * 100).toFixed(0)}%</span>
            </div>
          )}
      </div>
    </div>
  )
}
