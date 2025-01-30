import type { PickingInfo } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import { useQuery } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useState } from 'react'

import carFront from '@/assets/car-front.svg'
import { getAgents } from '@/http/agents/get-agents'
import { Agent } from '@/models/entities'

export interface UseAgents {
  data: Agent[]
  failed: boolean
  layer: IconLayer<Agent, object>
  isLoading: boolean
  isVisible: boolean
  setIsVisible: Dispatch<SetStateAction<boolean>>
  hoveredObject: PickingInfo<Agent> | null
  setHoveredObject: Dispatch<SetStateAction<PickingInfo<Agent> | null>>
  setIsHoveringInfoCard: Dispatch<SetStateAction<boolean>>
}

export function useAgents(): UseAgents {
  const [hoveredObject, setHoveredObject] = useState<PickingInfo<Agent> | null>(
    null,
  )
  const [isVisible, setIsVisible] = useState(false)
  const [isHoveringInfoCard, setIsHoveringInfoCard] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => getAgents(),
    refetchInterval: 1000 * 60, // 1 min
  })

  const layer = new IconLayer<Agent>({
    id: 'agents',
    data,
    pickable: true,
    getSize: 24,
    autoHighlight: true,
    highlightColor: [4, 120, 87, 250], // emerald-700
    visible: isVisible,
    getIcon: () => ({
      url: carFront.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    getPosition: (info) => [info.longitude, info.latitude],
    onHover: (info) => {
      if (!isHoveringInfoCard) {
        setHoveredObject(info.object ? info : null)
      }
    },
  })

  return {
    data: data || [],
    failed: !data && !isLoading,
    layer,
    isLoading,
    isVisible,
    setIsVisible,
    hoveredObject,
    setHoveredObject,
    setIsHoveringInfoCard,
  }
}
