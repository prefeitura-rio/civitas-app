import { Spinner } from '@/components/custom/spinner'
import { useMap } from '@/hooks/use-contexts/use-map-context'

import { ActionButtons } from './components/action-buttons'
import { PlateList } from './components/plate-list'
import { SearchByPlateFilterForm } from './components/search-by-plate-filter-form'
import { TripList } from './components/trip-list/trip-list'
import { useVehicles } from '@/hooks/use-queries/use-vehicles'
import { useState } from 'react'

export function SearchByPlate() {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const {
    layers: {
      trips: { possiblePlates, trips, isLoading },
    },
  } = useMap()
  const { data: vehicles } = useVehicles({ possiblePlates: possiblePlates || [], progress: (i) => setLoadingProgress(i) })
  return (
    <div className="h-full space-y-2">
      <SearchByPlateFilterForm />
      <ActionButtons />
      {isLoading ? (
        <div className="flex h-[calc(100%-15rem)] w-full items-center justify-center">
          <Spinner className="size-10" />
        </div>
      ) : (
        (possiblePlates && <PlateList vehicles={vehicles} loadingProgress={loadingProgress}/>) || (trips && <TripList />)
      )}
    </div>
  )
}
