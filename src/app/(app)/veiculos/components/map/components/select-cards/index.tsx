import { useMapLayers } from '@/stores/use-map-store'

import { CameraSelectCard } from '../select-cards/camera-select-card'
import { FogoCruzadoSelectCard } from '../select-cards/fogo-cruzado-select-card'
import { RadarSelectCard } from '../select-cards/radar-select-card'

export function SelectionCards() {
  const {
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
  } = useMapLayers()

  return (
    <>
      <CameraSelectCard
        selectedObject={selectedCamera}
        setSelectedObject={setSelectedCamera}
      />
      <RadarSelectCard
        selectedObject={selectedRadar}
        setSelectedObject={setSelectedRadar}
      />
      {/* Debug: {selectedRadar ? `Radar selecionado: ${selectedRadar.cetRioCode}` : 'Nenhum radar selecionado'} */}
      <FogoCruzadoSelectCard
        selectedObject={selectedFogoCruzado}
        setSelectedObject={setSelectedFogoCruzado}
      />
    </>
  )
}
