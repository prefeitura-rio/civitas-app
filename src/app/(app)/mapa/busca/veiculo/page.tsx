'use client'
import { useEffect } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'

import { PlateList } from './components/plate-list'
import { TripList } from './components/trip-list/trip-list'

export default function Veiculo() {
  const {
    layers: {
      trips: { trips, isLoading, possiblePlates, getTrips },
    },
  } = useMap()
  const { formattedSearchParams } = useCarPathsSearchParams()

  useEffect(() => {
    getTrips({
      plate: formattedSearchParams.plate,
      startTime: formattedSearchParams.from,
      endTime: formattedSearchParams.to,
    })
  }, [getTrips])

  return (
    <div className="h-full space-y-2">
      {/* <ActionButtons /> */}
      {isLoading ? (
        <div className="flex h-[calc(100%-7rem)] w-full items-center justify-center">
          <Spinner className="size-10" />
        </div>
      ) : (
        (possiblePlates && <PlateList />) || (trips && <TripList />)
      )}
    </div>
  )
}
