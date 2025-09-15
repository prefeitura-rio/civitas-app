import { useMemo } from 'react'

import { useCameraCOR } from '@/hooks/mapLayers/use-cameras'
import { useFogoCruzadoIncidents } from '@/hooks/mapLayers/use-fogo-cruzado'
import { useRadarLayer } from '@/hooks/mapLayers/use-radar-layer'
import { useMapSize } from '@/hooks/use-map-size'
import { useMapStore } from '@/stores/use-map-store'

import { CameraSelectCard } from '../select-cards/camera-select-card'
import { FogoCruzadoSelectCard } from '../select-cards/fogo-cruzado-select-card'
import { RadarSelectCard } from '../select-cards/radar-select-card'

export function SelectionCards() {
  const { width: mapWidth } = useMapSize()

  // Direct hook usage instead of context
  const multipleSelectedRadars = useMapStore(
    (state) => state.multipleSelectedRadars,
  )
  const cameras = useCameraCOR()
  const radars = useRadarLayer(multipleSelectedRadars)
  const fogoCruzado = useFogoCruzadoIncidents()

  const radarInfoMode = useMapStore((state) => state.radarInfoMode)
  const setRadarInfoMode = useMapStore((state) => state.setRadarInfoMode)

  const marginTop = useMemo(() => (mapWidth < 1060 ? 'mt-12' : ''), [mapWidth])

  return (
    <>
      <CameraSelectCard
        selectedObject={cameras.selectedObject}
        setSelectedObject={cameras.setSelectedObject}
        className={marginTop}
      />

      <RadarSelectCard
        selectedObject={radars.selectedObject}
        setSelectedObject={radars.setSelectedObject}
        className={marginTop}
      />

      <RadarSelectCard
        selectedObject={null}
        setSelectedObject={() => {}}
        infoMode={true}
        infoObject={radarInfoMode}
        setInfoObject={setRadarInfoMode}
        className={marginTop}
      />
      <FogoCruzadoSelectCard
        selectedObject={fogoCruzado.selectedObject}
        setSelectedObject={fogoCruzado.setSelectedObject}
      />
    </>
  )
}
