import { format } from 'date-fns'
import React, { useState } from 'react'

import { Card, CardDescription } from '@/components/ui/card'
import { useCarPath } from '@/hooks/useCarPathContext'
import { formatLocation } from '@/utils/formatLocation'

export function SideList() {
  const { carPath } = useCarPath()

  const [selectedTripIndex, setSelectedTripIndex] = useState(1)

  const trip = carPath?.at(selectedTripIndex)

  return (
    <div className="flex flex-col gap-4">
      {trip &&
        trip.locations.map((tripLocations) => {
          return tripLocations.map((tripLocation, index) => {
            const { location, direction, lane } = formatLocation(
              tripLocation.localidade,
            )

            return (
              <Card className="flex min-w-80 gap-6 p-4">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <span className="font-bold text-black">{index + 1}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <CardDescription className="text-sm">
                    Localização:
                  </CardDescription>
                  <div className="flex flex-col gap-1">
                    <span className="block">{location}</span>
                    <span className="block text-sm text-muted-foreground">
                      Sentido: {direction}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Faixa: {lane}
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    Data:{' '}
                    {format(
                      new Date(tripLocation.datahora),
                      'yyyy/MM/dd às HH:mm',
                    )}
                  </CardDescription>
                </div>
              </Card>
            )
          })
        })}
    </div>
  )
}
