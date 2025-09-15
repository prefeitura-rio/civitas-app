import { useMemo } from 'react'

import { useMapSize } from '@/hooks/use-map-size'
import { useMap } from '@/hooks/useContexts/use-map-context'

import { CameraSelectCard } from '../select-cards/camera-select-card'
import { FogoCruzadoSelectCard } from '../select-cards/fogo-cruzado-select-card'
import { RadarSelectCard } from '../select-cards/radar-select-card'

export function SelectionCards() {
  const { width: mapWidth } = useMapSize()
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

  const marginTop = useMemo(() => (mapWidth < 854 ? 'mt-12' : ''), [mapWidth])

  return (
    <>
      <CameraSelectCard
        selectedObject={selectedCamera}
        setSelectedObject={setSelectedCamera}
        className={marginTop}
      />
      <RadarSelectCard
        selectedObject={selectedRadar}
        setSelectedObject={setSelectedRadar}
        className={marginTop}
      />
      {/* Debug: {selectedRadar ? `Radar selecionado: ${selectedRadar.cetRioCode}` : 'Nenhum radar selecionado'} */}
      <FogoCruzadoSelectCard
        selectedObject={selectedFogoCruzado}
        setSelectedObject={setSelectedFogoCruzado}
      />
    </>
  )
}
