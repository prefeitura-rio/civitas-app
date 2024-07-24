import { Loader2 } from 'lucide-react'

import { useMap } from '@/hooks/use-contexts/use-map-context'

import { ActionButtons } from '../action-buttons'
import { TripList } from '../trip-list/trip-list'
import { PlateList } from './components/plate-list'
import { SearchByPlateFilterForm } from './components/search-by-plate-filter-form'

export function SearchByPlate() {
  const {
    layers: {
      trips: { possiblePlates, trips, isLoading },
    },
  } = useMap()
  return (
    <div className="h-full space-y-2">
      <SearchByPlateFilterForm />
      <ActionButtons />
      {isLoading ? (
        <div className="flex h-[calc(100%-15rem)] w-full items-center justify-center">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </div>
      ) : (
        (possiblePlates && <PlateList />) || (trips && <TripList />)
      )}
    </div>
  )
}
