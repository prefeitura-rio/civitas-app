import { Loader2 } from 'lucide-react'
import React from 'react'

import { Separator } from '@/components/ui/separator'
import { useCarPath } from '@/hooks/useCarPathContext'

import { TripCard } from './trip-card'

export function TripList() {
  const { trips, isLoading } = useCarPath()
  console.log(isLoading)

  return (
    <div className="mb-4 h-full overflow-y-scroll">
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
          <div className="relative flex h-full w-full flex-col bg-card">
            {trips.map((trip, index) => {
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
            })}
          </div>
        ))
      )}
    </div>
  )
}
