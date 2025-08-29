import { useMap } from '@/hooks/useContexts/use-map-context'

import { CameraSelectCard } from '../select-cards/camera-select-card'
import { FogoCruzadoSelectCard } from '../select-cards/fogo-cruzado-select-card'

export function SelectionCards() {
  const {
    layers: {
      cameras: {
        selectedObject: selectedCamera,
        handleSelectObject: setSelectedCamera,
      },
      // radars: {
      //   selectedObject: selectedRadar,
      //   handleSelectObject: setSelectedRadar,
      // },
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
      {/* Temporariamente comentado até resolver os problemas de tipo
      <RadarSelectCard
        selectedObject={selectedRadar}
        setSelectedObject={(radar: any) => {
          if (radar === null) {
            // Se for null, limpa a seleção
            setSelectedRadar(null)
          } else {
            // Se for um radar, seleciona ele e limpa a câmera
            setSelectedRadar(radar, () => {
              // Limpa a câmera selecionada quando um radar é selecionado
              const {
                layers: {
                  cameras: { setSelectedObject: setSelectedCamera },
                },
              } = useMap()
              setSelectedCamera(null)
            })
          }
        }}
      />
      */}
      <FogoCruzadoSelectCard
        selectedObject={selectedFogoCruzado}
        setSelectedObject={setSelectedFogoCruzado}
      />
    </>
  )
}
