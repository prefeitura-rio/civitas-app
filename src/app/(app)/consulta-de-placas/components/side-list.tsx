import React from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCarPath } from '@/hooks/useCarPathContext'

import { PointCard } from './side-list/point-card'
import { TripCard } from './side-list/trip-card'

export function SideList() {
  const { trips, selectedTripIndex } = useCarPath()

  return (
    <Tabs defaultValue="trips" className="h-full w-full max-w-sm">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="trips">Viagens</TabsTrigger>
        <TabsTrigger value="route">Rota</TabsTrigger>
      </TabsList>
      {/* Trips */}
      <TabsContent
        value="trips"
        className="max-h-[calc(100%-3rem)] flex-col gap-4 overflow-y-scroll p-4 data-[state=active]:flex data-[state=inactive]:hidden"
      >
        {trips?.at(0) ? (
          trips.map((trip, index) => {
            const startLocation = trip.points[0]
            const endLocation = trip.points[trip.points.length - 1]

            return (
              <TripCard
                key={index}
                index={index}
                startLocation={startLocation}
                endLocation={endLocation}
              />
            )
          })
        ) : (
          <div>
            <span className="text-sm text-muted-foreground">
              Use o formulário acima para gerar os dados no mapa.
            </span>
          </div>
        )}
      </TabsContent>
      {/* Points */}
      <TabsContent
        value="route"
        className="max-h-[calc(100%-3rem)] flex-col gap-4 overflow-y-scroll p-4 data-[state=active]:flex data-[state=inactive]:hidden"
      >
        {trips?.at(selectedTripIndex) ? (
          trips?.at(selectedTripIndex)?.points.map((point, index) => {
            return <PointCard key={index} {...point} index={index} />
          })
        ) : (
          <div>
            <span className="text-sm text-muted-foreground">
              Use o formulário acima para gerar os dados no mapa.
            </span>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
