import { useContext } from 'react'

import { MapLayersContext } from '@/contexts/map-layers-context'

export function useMapLayers() {
  const mapLayersContext = useContext(MapLayersContext)
  return mapLayersContext
}
