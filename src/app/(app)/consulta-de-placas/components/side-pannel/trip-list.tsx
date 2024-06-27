import React from 'react'

import { Separator } from '@/components/ui/separator'
import { useCarPath } from '@/hooks/useCarPathContext'

import { TripCard } from './trip-card'

export function TripList() {
  const { trips } = useCarPath()

  return (
    <div className="mb-4 overflow-y-scroll">
      {trips && (
        <>
          <div className="relative flex h-full w-full">
            {trips.length > 0 ? (
              <div className="flex h-full w-full flex-col bg-card">
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
        </>
      )}
    </div>
  )
}
