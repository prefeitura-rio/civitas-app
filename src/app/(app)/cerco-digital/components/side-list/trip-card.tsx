import { format } from 'date-fns'

import { Card, CardDescription } from '@/components/ui/card'
import { useCarPath } from '@/hooks/useCarPathContext'
import type { Point } from '@/utils/formatCarPathResponse'

interface TripCardProps {
  index: number
  startLocation: Point
  endLocation: Point
}

export function TripCard({ index, startLocation, endLocation }: TripCardProps) {
  const { setSelectedTripIndex, setViewport, viewport, trips } = useCarPath()
  return (
    <Card
      className="flex min-w-80 gap-6 p-4 hover:scale-102 hover:cursor-pointer hover:bg-border"
      onClick={() => {
        setSelectedTripIndex(index)
        setViewport({
          ...viewport,
          longitude:
            trips?.at(index)?.points.at(0)?.from[0] || viewport.longitude,
          latitude:
            trips?.at(index)?.points.at(0)?.from[1] || viewport.latitude,
        })
      }}
    >
      <div className="flex items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <span className="font-bold text-black">{index + 1}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <span>Localização Inicial:</span>
          <CardDescription className="text-sm">
            <span className="block">{startLocation.location}</span>
            Data:{' '}
            {format(
              new Date(startLocation?.startTime || ''),
              "dd/MM/yyyy 'às' HH:mm",
            )}
          </CardDescription>
        </div>
        <div className="flex flex-col">
          <span>Localização Final:</span>
          <CardDescription className="text-sm">
            <span className="block">{endLocation.location}</span>
            Data:{' '}
            {format(
              new Date(endLocation?.startTime || ''),
              "dd/MM/yyyy 'às' HH:mm",
            )}
          </CardDescription>
        </div>
      </div>
    </Card>
  )
}
