import type { PickingInfo } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import { useQuery } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useState } from 'react'

import siren from '@/assets/siren-red-500.svg'
import { getWazePoliceAlerts } from '@/http/waze/police/get-waze-police-alerts'
import { WazeAlert } from '@/models/entities'

export interface UseWazePoliceAlerts {
  data: WazeAlert[]
  failed: boolean
  layer: IconLayer<WazeAlert, object>
  isLoading: boolean
  isVisible: boolean
  setIsVisible: Dispatch<SetStateAction<boolean>>
  hoveredObject: PickingInfo<WazeAlert> | null
  setHoveredObject: Dispatch<SetStateAction<PickingInfo<WazeAlert> | null>>
  setIsHoveringInfoCard: Dispatch<SetStateAction<boolean>>
}

export function useWazePoliceAlerts(): UseWazePoliceAlerts {
  const [hoveredObject, setHoveredObject] =
    useState<PickingInfo<WazeAlert> | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHoveringInfoCard, setIsHoveringInfoCard] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['waze', 'police'],
    queryFn: () => getWazePoliceAlerts(),
    refetchInterval: 1000 * 60 * 5, // 5 min
  })

  const layer = new IconLayer<WazeAlert>({
    id: 'waze-police-alert',
    data,
    getPosition: (info) => [info.longitude, info.latitude],
    getSize: 24,
    getIcon: () => ({
      url: siren.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    pickable: true,
    onHover: (info) => {
      if (!isHoveringInfoCard) {
        setHoveredObject(info.object ? info : null)
      }
    },
    highlightColor: [220, 38, 38, 255], // red-600
    autoHighlight: true,
    visible: isVisible,
    highlightedObjectIndex: hoveredObject?.object
      ? hoveredObject.index
      : undefined,
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
