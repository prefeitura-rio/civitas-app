import type { PickingInfo } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import { useQuery } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useState } from 'react'

import videoCamera from '@/assets/video-camera.svg'
import videoCameraFilled from '@/assets/video-camera-filled.svg'
import { getCameraCOR } from '@/http/cameras-cor/get-cameras-cor'
import { CameraCOR } from '@/models/entities'

export interface UseCameraCOR {
  data: CameraCOR[]
  failed: boolean
  layers: {
    cameraCORLayer: IconLayer<CameraCOR, object>
    selectedCameraCORLayer: IconLayer<CameraCOR, object>
  }
  layerStates: {
    isLoading: boolean
    isVisible: boolean
    setIsVisible: Dispatch<SetStateAction<boolean>>
    hoverInfo: PickingInfo<CameraCOR>
    setHoverInfo: Dispatch<SetStateAction<PickingInfo<CameraCOR>>>
    selectedCameraCOR: CameraCOR | null
    setSelectedCameraCOR: Dispatch<SetStateAction<CameraCOR | null>>
  }
}

export function useCameraCOR(): UseCameraCOR {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<CameraCOR>>(
    {} as PickingInfo<CameraCOR>,
  )
  const [isVisible, setIsVisible] = useState(false)
  const [selectedCameraCOR, setSelectedCameraCOR] = useState<CameraCOR | null>(
    null,
  )

  const { data, isLoading } = useQuery({
    queryKey: ['cameras'],
    queryFn: () => getCameraCOR(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const cameraCORLayer = new IconLayer<CameraCOR>({
    id: 'cameras',
    data,
    pickable: true,
    getSize: 24,
    autoHighlight: true,
    highlightColor: [7, 76, 128, 250], // CIVITAS-dark-blue
    visible: isVisible,
    getIcon: () => ({
      url: videoCamera.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    getPosition: (info) => [info.longitude, info.latitude],
    onHover: (info) => setHoverInfo(info),
    onClick: (info) => {
      setSelectedCameraCOR(info.object)
    },
  })

  const selectedCameraCORLayer = new IconLayer<CameraCOR>({
    id: 'selected-camera',
    data: selectedCameraCOR ? [selectedCameraCOR] : [],
    getPosition: (info) => [info.longitude, info.latitude],
    getSize: 24,
    getIcon: () => ({
      url: videoCameraFilled.src,
      width: 48,
      height: 48,
      mask: false,
    }),
    onHover: (info) => {
      setHoverInfo(info)
    },
    visible: isVisible && !!selectedCameraCOR,
  })

  return {
    data: data || [],
    failed: !data && !isLoading,
    layers: {
      cameraCORLayer,
      selectedCameraCORLayer,
    },
    layerStates: {
      isLoading,
      isVisible,
      setIsVisible,
      hoverInfo,
      setHoverInfo,
      selectedCameraCOR,
      setSelectedCameraCOR,
    },
  }
}
