import React from 'react'

import { Separator } from '@/components/ui/separator'
import { useCarPath } from '@/hooks/useCarPathContext'

import { TripCard } from './side-list/trip-card'

export function SideList() {
  const { trips } = useCarPath()

  console.log(trips)

  return (
    <>
      {trips && (
        <div className="flex h-full w-full max-w-sm">
          {trips.length > 0 ? (
            <div className="flex h-full w-full flex-col overflow-y-scroll bg-card">
              {trips?.at(0) ? (
                trips.map((trip, index) => {
                  const startLocation = trip.points[0]
                  const endLocation = trip.points[trip.points.length - 1]

                  return (
                    <>
                      <TripCard
                        key={index}
                        index={index}
                        startLocation={startLocation}
                        endLocation={endLocation}
                      />
                      <Separator className="bg-muted" />
                    </>
                  )
                })
              ) : (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Use o formulário acima para gerar os dados no mapa.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <span></span>
          )}
        </div>
      )}
    </>
  )
}
