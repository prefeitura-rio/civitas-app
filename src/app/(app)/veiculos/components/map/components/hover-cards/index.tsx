import { useMap } from '@/hooks/useContexts/use-map-context'

import { DetectionPointHoverCard } from './detection-point-hover-card'

export function HoverCards() {
  const {
    layers: {
      trips: {
        hoveredObject: hoveredDetectionPoint,
        setIsHoveringInfoCard: setIsHoveringDetectionPointInfoCard,
      },
    },
  } = useMap()

  return (
    <>
      <DetectionPointHoverCard
        hoveredObject={hoveredDetectionPoint}
        setIsHoveringInfoCard={setIsHoveringDetectionPointInfoCard}
      />
    </>
  )
}
