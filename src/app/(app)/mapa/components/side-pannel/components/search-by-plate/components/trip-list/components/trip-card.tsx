import { format } from 'date-fns'
import { ChevronRight, TriangleAlert } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import type { Point } from '@/models/entities'

import { PointCard } from './point-card'

interface TripCardProps {
  index: number
  startLocation: Point
  endLocation: Point
  cloneAlert: boolean
}

function getTimeDiff(a: Date, b: Date) {
  const diff = Math.abs(a.getTime() - b.getTime())

  const totalMinutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)

  if (hours > 0) {
    return `${hours} hr ${minutes} min`
  }

  return `${minutes} min`
}

export function TripCard({
  index,
  startLocation,
  endLocation,
  cloneAlert,
}: TripCardProps) {
  const {
    setViewport,
    layers: {
      trips: { trips, selectedTrip, setSelectedTrip },
    },
  } = useMap()

  const points = selectedTrip?.points || []
  const isSelected = selectedTrip?.index === index

  function handleTripClick() {
    setSelectedTrip(index)
    const longitude = trips?.at(index)?.points?.at(0)?.from[0]
    const latitude = trips?.at(index)?.points?.at(0)?.from[1]
    setViewport({
      longitude,
      latitude,
    })
  }

  const startTime = new Date(startLocation.startTime)
  const endTime = new Date(endLocation.startTime)
  const dayInterval = endTime.getDate() - startTime.getDate()
  const timeInterval = getTimeDiff(startTime, endTime)
  const totalIndexes = endLocation.index - startLocation.index

  return (
    <div
      className={twMerge(
        'space-y-4 border-l-4 border-l-transparent p-4 tracking-tighter hover:cursor-pointer hover:bg-border',
        isSelected ? 'border-l-4 border-l-primary' : '',
      )}
      onClick={(e) => {
        e.stopPropagation()
        handleTripClick()
      }}
    >
      {/* First row: Date and Time */}
      <div className={'flex font-bold'}>
        <div className="inline-flex">
          <div className="w-20">
            <span className="">{format(startTime, 'dd/MMM')}</span>
          </div>
          <div className="relative">
            <span className="relative whitespace-nowrap text-justify">{`${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`}</span>
            {dayInterval > 0 && (
              <span className="absolute -right-5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-sm bg-card-foreground text-xs text-card">
                +{dayInterval}
              </span>
            )}
          </div>
        </div>
        <div className="flex w-full justify-end">
          <span className="whitespace-nowrap text-end">{timeInterval}</span>
        </div>
      </div>

      {cloneAlert && (
        <Tooltip
          className="p-0"
          render={
            <Card className="m-0">
              <CardHeader>
                <CardTitle className="text-center">
                  Alerta de suspeita de placa clonada:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  O alerta de suspeita de placa clonada é acionado quando o
                  intervalo de tempo e a distância entre dois pontos de detecção
                  são incompatíveis. Por exemplo, se dois pontos subsequentes
                  apresentam um intervalo curto e uma distância grande, isso
                  pode sugerir que há dois veículos com a mesma placa circulando
                  pela cidade simultaneamente.
                </p>

                <p>
                  No entanto, é importante destacar que os registros de pontos
                  de detecção estão sujeitos a falhas de leitura dos radares, o
                  que também poderia explicar o caso mencionado acima.
                </p>
              </CardContent>
            </Card>
          }
        >
          <div className="flex items-center gap-2 pl-20 text-destructive">
            <TriangleAlert className="mb-0.5 h-4 w-4" />
            <span>Suspeita de placa clonada</span>
          </div>
        </Tooltip>
      )}

      {/* Second row: Districts */}
      <div className="flex w-full items-center gap-2 pl-20 text-muted-foreground">
        <span>{startLocation.district.capitalizeFirstLetter()}</span>
        {totalIndexes > 0 && (
          <>
            <div className="flex gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              {totalIndexes > 1 && (
                <>
                  <span className="text-xs">+{totalIndexes - 1}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </div>
            <span>{endLocation.district.capitalizeFirstLetter()}</span>
          </>
        )}
      </div>

      {/* Point List */}
      {isSelected && (
        <div className="flex flex-col pl-20 text-sm">
          {points.length > 0 ? (
            points.map((point, index) => (
              <PointCard key={index} point={point} />
            ))
          ) : (
            <span>Nenhum resultado encontrado</span>
          )}
        </div>
      )}
    </div>
  )
}
