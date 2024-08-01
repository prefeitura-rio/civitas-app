import type { PickingInfo } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import { useQuery } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useState } from 'react'

import carFront from '@/assets/car-front.svg'
import { getAgents } from '@/http/agents/get-agents'
import { Agent } from '@/models/entities'

export interface UseAgents {
  data: Agent[]
  layer: IconLayer<Agent, object>
  layerStates: {
    isLoading: boolean
    isVisible: boolean
    setIsVisible: Dispatch<SetStateAction<boolean>>
    hoverInfo: PickingInfo<Agent>
    setHoverInfo: Dispatch<SetStateAction<PickingInfo<Agent>>>
  }
}

export function useAgents(): UseAgents {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Agent>>(
    {} as PickingInfo<Agent>,
  )
  const [isVisible, setIsVisible] = useState(false)

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
    onHover: (info) => setHoverInfo(info),
  })

  return {
    data: data || [],
    layer,
    layerStates: {
      isLoading,
      isVisible,
      setIsVisible,
      hoverInfo,
      setHoverInfo,
    },
  }
}
