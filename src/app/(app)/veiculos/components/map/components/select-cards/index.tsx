import { useMemo } from 'react'

import { useMapLayers } from '@/hooks/maps/use-map-layers'
import { useMapSize } from '@/hooks/use-map-size'
import { useMapStore } from '@/stores/use-map-store'

import { CameraSelectCard } from '../select-cards/camera-select-card'
import { FogoCruzadoSelectCard } from '../select-cards/fogo-cruzado-select-card'
import { RadarSelectCard } from '../select-cards/radar-select-card'

export function SelectionCards() {
  const { width: mapWidth } = useMapSize()

  const mapLayers = useMapLayers()

  const radarInfoMode = useMapStore((state) => state.radarInfoMode)
  const setRadarInfoMode = useMapStore((state) => state.setRadarInfoMode)

  const marginTop = useMemo(() => (mapWidth < 1060 ? 'mt-12' : ''), [mapWidth])

  return (
    <>
      <CameraSelectCard
        selectedObject={mapLayers.selectedCamera}
        setSelectedObject={mapLayers.setSelectedCamera}
        className={marginTop}
      />

      <RadarSelectCard
        selectedObject={mapLayers.selectedRadar}
        setSelectedObject={mapLayers.setSelectedRadar}
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
        selectedObject={mapLayers.selectedFogoCruzado}
        setSelectedObject={mapLayers.setSelectedFogoCruzado}
      />
    </>
  )
}
