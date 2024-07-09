import { useContext } from 'react'

import { OfficialCarsContext } from '@/contexts/official-cars-context'

export function useOfficialCars() {
  const officialCarsContext = useContext(OfficialCarsContext)

  return officialCarsContext
}
