import { RadarList } from './components/radar-list'
import { SearchByRadarFilterForm } from './components/search-by-radar-filter-form'

export function SearchByRadar() {
  return (
    <>
      <SearchByRadarFilterForm />
      <RadarList />
    </>
  )
}
