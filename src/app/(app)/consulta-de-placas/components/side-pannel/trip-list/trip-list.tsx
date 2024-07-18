import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import React from 'react'

import { Separator } from '@/components/ui/separator'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'

import { TripCard } from './components/trip-card'

export function TripList() {
  const { trips, isLoading, lastSearchParams } = useCarPath()
  if (!lastSearchParams) return null

  return (
    <div className="h-[calc(100%-15rem)] w-full overflow-y-scroll">
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </div>
      ) : (
        trips &&
        (trips.length === 0 ? (
          <div className="flex h-full w-full justify-center">
            <span className="text-muted-foreground">
              Nenhum resultado encontrado.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <h4 className="text-muted-foreground">
                Resultado para{' '}
                <span className="code-highlight">{lastSearchParams.placa}</span>
              </h4>
              <span className="block text-sm text-muted-foreground">
                {`De ${format(lastSearchParams.startTime, "dd 'de' MMMM 'de' y 'às' HH'h'mm'min'", { locale: ptBR })}`}
              </span>
              <span className="block text-sm text-muted-foreground">
                {`Até  ${format(lastSearchParams.endTime, "dd 'de' MMMM 'de' y 'às' HH'h'mm'min'", { locale: ptBR })}`}
              </span>
            </div>
            <ul className="relative flex h-full w-full flex-col bg-card">
              {trips.map((trip, index) => {
                const startLocation = trip.points[0]
                const endLocation = trip.points[trip.points.length - 1]

                return (
                  <li key={index}>
                    <TripCard
                      index={index}
                      startLocation={startLocation}
                      endLocation={endLocation}
                    />
                    <Separator className="bg-muted" />
                  </li>
                )
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}
