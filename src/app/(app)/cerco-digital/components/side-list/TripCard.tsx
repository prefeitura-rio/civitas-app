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
  const { setSelectedTripIndex } = useCarPath()
  return (
    <Card
      className="z-999999 flex min-w-80 gap-6 p-4 hover:scale-105 hover:cursor-pointer"
      onClick={() => setSelectedTripIndex(index)}
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
              new Date(startLocation?.date || ''),
              "dd/MM/yyyy 'às' HH:mm",
            )}
          </CardDescription>
        </div>
        <div className="flex flex-col">
          <span>Localização Final:</span>
          <CardDescription className="text-sm">
            <span className="block">{endLocation.location}</span>
            Data:{' '}
            {format(new Date(endLocation?.date || ''), "dd/MM/yyyy 'às' HH:mm")}
          </CardDescription>
        </div>
      </div>
    </Card>
  )
}
