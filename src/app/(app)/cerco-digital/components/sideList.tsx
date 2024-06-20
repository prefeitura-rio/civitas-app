import React from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCarPath } from '@/hooks/useCarPathContext'

import { PointCard } from './side-list/PointCard'
import { TripCard } from './side-list/TripCard'

export function SideList() {
  const { trips, selectedTripIndex } = useCarPath()

  return (
    <Tabs defaultValue="trips" className="w-full max-w-sm">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="trips">Viagens</TabsTrigger>
        <TabsTrigger value="route">Rota</TabsTrigger>
      </TabsList>
      {/* Trips */}
      <TabsContent
        value="trips"
        className="flex max-h-[40rem] flex-col gap-4 overflow-y-scroll p-4"
      >
        {trips &&
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
          })}
      </TabsContent>
      {/* Points */}
      <TabsContent
        value="route"
        className="flex max-h-[40rem] flex-col gap-4 overflow-y-scroll"
      >
        {trips?.at(selectedTripIndex) &&
          trips?.at(selectedTripIndex)?.points.map((point, index) => {
            return <PointCard key={index} {...point} index={index} />
          })}
      </TabsContent>
    </Tabs>
  )
}
