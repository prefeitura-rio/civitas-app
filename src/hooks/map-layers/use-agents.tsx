import type { PickingInfo } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import { useQuery } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useState } from 'react'

import carFront from '@/assets/car-front.svg'
import carFrontFilled from '@/assets/car-front-filled.svg'
import { getAgents } from '@/http/agents/get-agents'
import { Agent } from '@/models/entities'

export interface UseAgents {
  data: Agent[]
  layers: {
    AgentsLayer: IconLayer<Agent, object>
    selectedAgentsLayer: IconLayer<Agent, object>
  }
  layerStates: {
    isLoading: boolean
    isVisible: boolean
    setIsVisible: Dispatch<SetStateAction<boolean>>
    hoverInfo: PickingInfo<Agent>
    setHoverInfo: Dispatch<SetStateAction<PickingInfo<Agent>>>
    selectedAgents: Agent | null
    setSelectedAgents: Dispatch<SetStateAction<Agent | null>>
  }
}

export function useAgents(): UseAgents {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Agent>>(
    {} as PickingInfo<Agent>,
  )
  const [isVisible, setIsVisible] = useState(false)
  const [selectedAgents, setSelectedAgents] = useState<Agent | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => getAgents(),
  })

  // const data = [
  //   {
  //     name: 'string',
  //     contactInfo: 'string',
  //     operation: 'string',
  //     latitude: -22.85068727647364,
  //     longitude: -43.394607878463354,
  //     lastUpdate: '2024-07-29T17:36:41.955Z',
  //   },
  //   {
  //     name: 'string',
  //     contactInfo: 'string',
  //     operation: 'string',
  //     latitude: -22.850488921639798,
  //     longitude: -43.394991434270615,
  //     lastUpdate: '2024-07-29T17:36:41.955Z',
  //   },
  // ]

  const AgentsLayer = new IconLayer<Agent>({
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
    onClick: (info) => {
      setSelectedAgents(info.object)
    },
  })

  const selectedAgentsLayer = new IconLayer<Agent>({
    id: 'selected-agents',
    data: selectedAgents ? [selectedAgents] : [],
    getPosition: (info) => [info.longitude, info.latitude],
    getSize: 24,
    getIcon: () => ({
      url: carFrontFilled.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    onHover: (info) => {
      setHoverInfo(info)
    },
    visible: isVisible && !!selectedAgents,
  })

  return {
    data: data || [],
    layers: {
      AgentsLayer,
      selectedAgentsLayer,
    },
    layerStates: {
      isLoading,
      isVisible,
      setIsVisible,
      hoverInfo,
      setHoverInfo,
      selectedAgents,
      setSelectedAgents,
    },
  }
}
