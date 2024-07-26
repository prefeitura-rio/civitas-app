import type { PickingInfo } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import { useQuery } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useState } from 'react'

import cctvOrange from '@/assets/cctv-orange.svg'
import cctvOrangeFilled from '@/assets/cctv-orange-filled.svg'
import slash from '@/assets/slash-orange-500.svg'
import { getRadars } from '@/http/radars/get-radars'
import { Radar } from '@/models/entities'

export interface UseRadars {
  data: Radar[]
  layers: {
    radarLayer: IconLayer<Radar, object>
    slashInactiveRadarsLayer: IconLayer<Radar, object>
    selectedRadarLayer: IconLayer<Radar, object>
  }
  layerStates: {
    isLoading: boolean
    isVisible: boolean
    setIsVisible: Dispatch<SetStateAction<boolean>>
    hoverInfo: PickingInfo<Radar>
    setHoverInfo: Dispatch<SetStateAction<PickingInfo<Radar>>>
    selectedRadar: Radar | null
    setSelectedRadar: Dispatch<SetStateAction<Radar | null>>
  }
}

export function useRadars(): UseRadars {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Radar>>(
    {} as PickingInfo<Radar>,
  )
  const [isVisible, setIsVisible] = useState(false)
  const [selectedRadar, setSelectedRadar] = useState<Radar | null>(null)

  const { data: response, isLoading } = useQuery({
    queryKey: ['radars'],
    queryFn: () => getRadars(),
  })

  const radarLayer = new IconLayer<Radar>({
    id: 'radars',
    data: response?.data,
    getPosition: (info) => [info.longitude, info.latitude],
    getSize: 24,
    getIcon: () => ({
      url: cctvOrange.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    pickable: true,
    onClick: (info) => setSelectedRadar(info.object),
    onHover: (info) => {
      setHoverInfo(info)
    },
    highlightColor: [249, 115, 22, 255], // orange-500
    autoHighlight: true,
    visible: isVisible,
    highlightedObjectIndex: hoverInfo.object ? hoverInfo.index : undefined,
  })

  const slashInactiveRadarsLayer = new IconLayer<Radar>({
    id: 'inactive-radars',
    data: response?.data.filter(
      (item) => !item.activeInLast24Hours && item.hasData,
    ),
    getPosition: (radar) => [radar.longitude, radar.latitude],
    getSize: 24,
    getIcon: () => ({
      url: slash.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    pickable: true,
    onClick: (radar) => setSelectedRadar(radar.object),
    onHover: (info) => {
      setHoverInfo(info)
    },
    highlightColor: [249, 115, 22, 255], // orange-500
    autoHighlight: true,
    visible: isVisible,
    highlightedObjectIndex: hoverInfo.object ? hoverInfo.index : undefined,
  })

  const selectedRadarLayer = new IconLayer<Radar>({
    id: 'selected-radar',
    data: selectedRadar ? [selectedRadar] : [],
    getPosition: (info) => [info.longitude, info.latitude],
    getSize: 24,
    getIcon: () => ({
      url: cctvOrangeFilled.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    onHover: (info) => {
      setHoverInfo(info)
    },
    visible: isVisible && !!selectedRadar,
  })

  return {
    data: response?.data || [],
    layers: {
      radarLayer,
      slashInactiveRadarsLayer,
      selectedRadarLayer,
    },
    layerStates: {
      isLoading,
      isVisible,
      setIsVisible,
      hoverInfo,
      setHoverInfo,
      selectedRadar,
      setSelectedRadar,
    },
  }
}
