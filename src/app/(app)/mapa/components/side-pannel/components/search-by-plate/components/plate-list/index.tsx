import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Car } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { getPlateInfo } from '@/http/cars/plate/get-plate-info'

type Vehicle = {
  plate: string
  brandModel: string
  modelYear: string
  color: string
}

export function PlateList() {
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

  const { data: vehicles } = useQuery({
    queryKey: ['cortex', 'plate-info', ...possiblePlates],
    queryFn: async () => {
      return Promise.all(
        possiblePlates.map(async (plate) => {
          const response = await getPlateInfo(plate)
          return {
            plate,
            brandModel: response.marcaModelo,
            color: response.cor,
            modelYear: response.anoModelo,
          } as Vehicle
        }),
      )
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: possiblePlates.length <= 50,
  })

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
        {possiblePlates.length <= 50
          ? vehicles?.map((item) => (
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
          : possiblePlates.map((item) => (
              <Card>
                <span>{item}</span>
              </Card>
            ))}
      </div>
    </div>
  )
}
