import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import React from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Separator } from '@/components/ui/separator'
import { useMap } from '@/hooks/use-contexts/use-map-context'

import { PlateInfo } from './components/plate-info'
import { TripCard } from './components/trip-card'

export function TripList() {
  const {
    layers: {
      trips: { trips, lastSearchParams, isLoading },
    },
  } = useMap()

  if (!lastSearchParams) return null

  return (
    <div className="h-full w-full">
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner className="size-10" />
        </div>
      ) : (
        trips && (
          <div className="h-[calc(100%-4.75rem)] space-y-2">
            <div className="text-center">
              <h4 className="">
                Resultado para{' '}
                <span className="code-highlight">{lastSearchParams.plate}</span>
              </h4>
              <span className="text-sm text-muted-foreground">
                {`${format(lastSearchParams.startTime, 'dd MMM, y HH:mm', { locale: ptBR })} - ${format(lastSearchParams.endTime, 'dd MMM, y HH:mm', { locale: ptBR })}`}
              </span>
            </div>

            <div className="h-[calc(100%)]">
              <PlateInfo />
              <Separator className="my-3 bg-muted" />

              {trips.length === 0 ? (
                <div className="flex h-full w-full justify-center pt-6">
                  <span className="text-muted-foreground">
                    Nenhum resultado encontrado.
                  </span>
                </div>
              ) : (
                <ul className="flex h-full w-full flex-col">
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
          </div>
        )
      )}
    </div>
  )
}
