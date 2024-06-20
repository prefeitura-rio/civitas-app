import { useContext } from 'react'

import { CarPathContext } from '@/contexts/car-path-context'

export function useCarPath() {
  const carPathContext = useContext(CarPathContext)
  return carPathContext
}
