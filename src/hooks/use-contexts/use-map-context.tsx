import { useContext } from 'react'

import { MapContext } from '@/contexts/map-context'

export function useMap() {
  const mapContext = useContext(MapContext)
  return mapContext
}
