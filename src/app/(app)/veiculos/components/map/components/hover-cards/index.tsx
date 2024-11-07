import { useMap } from '@/hooks/use-contexts/use-map-context'

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
