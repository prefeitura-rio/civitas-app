import { useMemo } from 'react'

import { useMap } from '@/hooks/useContexts/use-map-context'
import { useViewportStore } from '@/stores/viewport-store'

import { CameraSelectCard } from '../select-cards/camera-select-card'
import { FogoCruzadoSelectCard } from '../select-cards/fogo-cruzado-select-card'
import { RadarSelectCard } from '../select-cards/radar-select-card'

export function SelectionCards() {
  const { mapWidth } = useViewportStore()
  const {
    layers: {
      cameras: {
        selectedObject: selectedCamera,
        handleSelectObject: setSelectedCamera,
      },
      radars: {
        selectedObject: selectedRadar,
        setSelectedObject: setSelectedRadar,
      },
      fogoCruzado: {
        selectedObject: selectedFogoCruzado,
        setSelectedObject: setSelectedFogoCruzado,
      },
    },
  } = useMap()

  const { minCameraMapWidthToMovePopup, minRadarMapWidthToMovePopup } =
    useMemo(() => {
      const minCameraMapWidthToMovePopup =
        mapWidth < 854 ? { marginTop: '48px' } : {}
      const minRadarMapWidthToMovePopup =
        mapWidth < 1010 ? { marginTop: '48px' } : {}
      return { minCameraMapWidthToMovePopup, minRadarMapWidthToMovePopup }
    }, [mapWidth])

  return (
    <>
      <CameraSelectCard
        selectedObject={selectedCamera}
        setSelectedObject={setSelectedCamera}
        style={minCameraMapWidthToMovePopup}
      />
      <RadarSelectCard
        selectedObject={selectedRadar}
        setSelectedObject={setSelectedRadar}
        style={minRadarMapWidthToMovePopup}
      />
      {/* Debug: {selectedRadar ? `Radar selecionado: ${selectedRadar.cetRioCode}` : 'Nenhum radar selecionado'} */}
      <FogoCruzadoSelectCard
        selectedObject={selectedFogoCruzado}
        setSelectedObject={setSelectedFogoCruzado}
      />
    </>
  )
}
