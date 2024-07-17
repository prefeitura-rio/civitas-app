import { ActionButtons } from './action-buttons'
import { SearchByPlateFilterForm } from './search-by-plate-filter-form'
import { TripList } from './trip-list'

export function SearchByPlate() {
  return (
    <>
      <SearchByPlateFilterForm />
      <ActionButtons />
      <TripList />
    </>
  )
}
