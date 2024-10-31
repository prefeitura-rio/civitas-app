import { useMap } from '@/hooks/use-contexts/use-map-context'

import { CameraSelectCard } from '../select-cards/camera-select-card'
import { FogoCruzadoSelectCard } from '../select-cards/fogo-cruzado-select-card'
import { AgentHoverCard } from './agent-hover-card'
import { AISPHoverCard } from './aisp-hover-card'
import { CameraHoverCard } from './camera-hover-card'
import { CISPHoverCard } from './cisp-hover-card'
import { DetectionPointHoverCard } from './detection-point-hover-card'
import { FogoCruzadoHoverCard } from './fogo-cruzado-hover-card'
import { RadarHoverCard } from './radar-hover-card'
import { WazePoliceAlertHoverCard } from './waze-police-alert-hover-card'

export function HoverCards() {
  const {
    layers: {
      radars: {
        hoveredObject: hoveredRadar,
        setIsHoveringInfoCard: setIsHoveringRadarInfoCard,
      },
      cameras: {
        hoveredObject: hoveredCamera,
        selectedObject: selectedCamera,
        setSelectedObject: setSelectedCamera,
        setIsHoveringInfoCard: setIsHoveringCameraInfoCard,
      },
      agents: {
        hoveredObject: hoveredAgent,
        setIsHoveringInfoCard: setIsHoveringAgentInfoCard,
      },
      fogoCruzado: {
        hoveredObject: hoveredFogoCruzado,
        setIsHoveringInfoCard: setIsHoveringFogoCruzadoInfoCard,
        selectedObject: selectedFogoCruzado,
        setSelectedObject: setSelectedFogoCruzado,
      },
      waze: {
        hoveredObject: hoveredWaze,
        setIsHoveringInfoCard: setIsHoveringWazeInfoCard,
      },
      trips: {
        hoveredObject: hoveredDetectionPoint,
        setIsHoveringInfoCard: setIsHoveringDetectionPointInfoCard,
      },
      AISP: {
        hoverInfo: hoveredAISP,
        setIsHoveringInfoCard: setIsHoveringAISPInfoCard,
      },
      CISP: {
        hoverInfo: hoveredCISP,
        setIsHoveringInfoCard: setIsHoveringCISPInfoCard,
      },
    },
  } = useMap()

  return (
    <>
      <RadarHoverCard
        hoveredObject={hoveredRadar}
        setIsHoveringInfoCard={setIsHoveringRadarInfoCard}
      />
      <CameraHoverCard
        hoveredObject={hoveredCamera}
        setIsHoveringInfoCard={setIsHoveringCameraInfoCard}
      />
      <CameraSelectCard
        selectedObject={selectedCamera}
        setSelectedObject={setSelectedCamera}
      />
      <FogoCruzadoHoverCard
        hoveredObject={hoveredFogoCruzado}
        setIsHoveringInfoCard={setIsHoveringFogoCruzadoInfoCard}
      />
      <FogoCruzadoSelectCard
        selectedObject={selectedFogoCruzado}
        setSelectedObject={setSelectedFogoCruzado}
      />
      <WazePoliceAlertHoverCard
        hoveredObject={hoveredWaze}
        setIsHoveringInfoCard={setIsHoveringWazeInfoCard}
      />
      <AgentHoverCard
        hoveredObject={hoveredAgent}
        setIsHoveringInfoCard={setIsHoveringAgentInfoCard}
      />
      <DetectionPointHoverCard
        hoveredObject={hoveredDetectionPoint}
        setIsHoveringInfoCard={setIsHoveringDetectionPointInfoCard}
      />
      <AISPHoverCard
        hoveredObject={hoveredAISP}
        setIsHoveringInfoCard={setIsHoveringAISPInfoCard}
      />
      <CISPHoverCard
        hoveredObject={hoveredCISP}
        setIsHoveringInfoCard={setIsHoveringCISPInfoCard}
      />
    </>
  )
}
