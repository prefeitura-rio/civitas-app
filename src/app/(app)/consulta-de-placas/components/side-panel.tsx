import { useMapLayers } from '@/hooks/use-contexts/use-map-layers-context'

import { SearchByPlate } from './side-pannel/search-by-plate/search-by-plate'
import { SearchByRadar } from './side-pannel/search-by-radar/search-by-radar'

export function SidePanel() {
  const {
    mapStates: { isRadarsEnabled },
  } = useMapLayers()

  return (
    <div className="flex h-screen w-full max-w-md flex-col px-4 py-2">
      {isRadarsEnabled ? <SearchByRadar /> : <SearchByPlate />}
    </div>
  )
}
