import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import React from 'react'

import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useMap } from '@/hooks/use-contexts/use-map-context'

import { TripCard } from './components/trip-card'

export function TripList() {
  const {
    layers: {
      trips: { trips, lastSearchParams, isLoading },
    },
  } = useMap()

  if (!lastSearchParams) return null

  return (
    <div className="h-[calc(100%-15rem)] w-full">
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner className="size-10" />
        </div>
      ) : (
        trips && (
          <div className="h-[calc(100%-4.75rem)] space-y-2">
            <div className="text-center">
              <h4 className="text-muted-foreground">
                Resultado para{' '}
                <span className="code-highlight">{lastSearchParams.plate}</span>
              </h4>
              <span className="block text-sm text-muted-foreground">
                {`De ${format(lastSearchParams.startTime, "dd 'de' MMMM 'de' y 'às' HH'h'mm'min'", { locale: ptBR })}`}
              </span>
              <span className="block text-sm text-muted-foreground">
                {`Até  ${format(lastSearchParams.endTime, "dd 'de' MMMM 'de' y 'às' HH'h'mm'min'", { locale: ptBR })}`}
              </span>
            </div>

            {trips.length === 0 ? (
              <div className="flex h-full w-full justify-center pt-6">
                <span className="text-muted-foreground">
                  Nenhum resultado encontrado.
                </span>
              </div>
            ) : (
              <ul className="relative flex h-full w-full flex-col overflow-y-scroll bg-card">
                {trips.map((trip, index) => {
                  const startLocation = trip.points[0]
                  const endLocation = trip.points[trip.points.length - 1]
                  const cloneAlert = trip.cloneAlert

                  return (
                    <li key={index}>
                      <TripCard
                        index={index}
                        startLocation={startLocation}
                        endLocation={endLocation}
                        cloneAlert={cloneAlert}
                      />
                      <Separator className="bg-muted" />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      )}
    </div>
  )
}
