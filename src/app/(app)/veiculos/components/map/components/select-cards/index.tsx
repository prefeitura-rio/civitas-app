import { useMap } from '@/hooks/use-contexts/use-map-context'

import { CameraSelectCard } from '../select-cards/camera-select-card'
import { FogoCruzadoSelectCard } from '../select-cards/fogo-cruzado-select-card'

export function SelectionCards() {
  const {
    layers: {
      cameras: {
        selectedObject: selectedCamera,
        handleSelectObject: setSelectedCamera,
      },
      fogoCruzado: {
        selectedObject: selectedFogoCruzado,
        setSelectedObject: setSelectedFogoCruzado,
      },
    },
  } = useMap()

  return (
    <>
      <CameraSelectCard
        selectedObject={selectedCamera}
        setSelectedObject={setSelectedCamera}
      />
      <FogoCruzadoSelectCard
        selectedObject={selectedFogoCruzado}
        setSelectedObject={setSelectedFogoCruzado}
      />
    </>
  )
}
