import { ActionButtons } from '../action-buttons'
import { TripList } from '../trip-list/trip-list'
import { PlateList } from './components/plate-list'
import { SearchByPlateFilterForm } from './components/search-by-plate-filter-form'

export function SearchByPlate() {
  return (
    <div className="h-full space-y-2">
      <SearchByPlateFilterForm />
      <ActionButtons />

      <PlateList />
      <TripList />
    </div>
  )
}
