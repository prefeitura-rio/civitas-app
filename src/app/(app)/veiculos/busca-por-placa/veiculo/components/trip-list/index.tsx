import { format } from 'date-fns'
import React from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { dateConfig } from '@/lib/date-config'
import { useMapLayers } from '@/stores/use-map-store'

import { TripCard } from './components/trip-card'
import { VehicleInfo } from './components/vehicle-info'

export function TripList() {
  const { trips } = useMapLayers()

  if (!trips.lastSearchParams) return null

  return (
    <Card className="w-full p-6">
      {trips.isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner className="size-10" />
        </div>
      ) : (
        trips.trips && (
          <div className="h-[calc(100%-4.75rem)] space-y-2">
            <div className="text-center">
              <h4 className="">
                Resultado para{' '}
                <span className="code-highlight">
                  {trips.lastSearchParams.plate}
                </span>
              </h4>
              <span className="text-sm text-muted-foreground">
                {`${format(trips.lastSearchParams.startTime, 'dd MMM, y HH:mm', { locale: dateConfig.locale })} - ${format(trips.lastSearchParams.endTime, 'dd MMM, y HH:mm', { locale: dateConfig.locale })}`}
              </span>
            </div>

            <div className="h-[calc(100%)]">
              <VehicleInfo plate={trips.lastSearchParams.plate} />
              <Separator className="my-3 bg-muted" />

              {trips.trips.length === 0 ? (
                <div className="flex h-full w-full justify-center pt-6">
                  <span className="text-muted-foreground">
                    Nenhum resultado encontrado.
                  </span>
                </div>
              ) : (
                <ul className="flex h-full w-full flex-col">
                  {trips.trips.map((trip, index) => {
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
    </Card>
  )
}
