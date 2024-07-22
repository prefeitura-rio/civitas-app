import type { PickingInfo } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import siren from '@/assets/siren-red-500.svg'
import { getWazePoliceAlerts } from '@/http/waze/police/get-waze-police-alerts'
import { WazeAlert } from '@/models/entities'

export function useWazePoliceAlerts() {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<WazeAlert>>(
    {} as PickingInfo<WazeAlert>,
  )
  const [isVisible, setIsVisible] = useState(false)

  const { data: response, isLoading } = useQuery({
    queryKey: ['waze', 'police'],
    queryFn: () => getWazePoliceAlerts(),
    refetchInterval: 1000 * 60 * 5, // 5 min
  })

  const layer = new IconLayer<WazeAlert>({
    id: 'waze-police-alert',
    data: response?.data,
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
      setHoverInfo(info)
    },
    highlightColor: [220, 38, 38, 255], // red-600
    autoHighlight: true,
    visible: isVisible,
    highlightedObjectIndex: hoverInfo?.object ? hoverInfo.index : undefined,
  })

  return {
    data: response?.data || [],
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
