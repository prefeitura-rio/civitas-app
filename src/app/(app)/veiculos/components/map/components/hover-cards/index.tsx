import { useMap } from '@/hooks/use-contexts/use-map-context'

import { DEPRECATEDCameraHoverCard } from './[deprecated]-camera-hover-card'
import { AgentHoverCard } from './agent-hover-card'
import { AISPHoverCard } from './aisp-hover-card'
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
        setIsHoveringInfoCard: setIsHoveringCameraInfoCard,
      },
      agents: {
        hoveredObject: hoveredAgent,
        setIsHoveringInfoCard: setIsHoveringAgentInfoCard,
      },
      fogoCruzado: {
        hoveredObject: hoveredFogoCruzado,
        setIsHoveringInfoCard: setIsHoveringFogoCruzadoInfoCard,
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
      <DEPRECATEDCameraHoverCard
        hoveredObject={hoveredCamera}
        setIsHoveringInfoCard={setIsHoveringCameraInfoCard}
      />
      <FogoCruzadoHoverCard
        hoveredObject={hoveredFogoCruzado}
        setIsHoveringInfoCard={setIsHoveringFogoCruzadoInfoCard}
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
