import type { PickingInfo } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import { useQuery } from '@tanstack/react-query'
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react'

import cameraIconAtlas from '@/assets/camera-icon-atlas.png'
import { getCamera } from '@/http/cameras-cor/get-cameras-cor'
import { Camera } from '@/models/entities'

export interface UseCamera {
  data: Camera[]
  failed: boolean
  layer: IconLayer<Camera, object>
  isLoading: boolean
  isVisible: boolean
  setIsVisible: Dispatch<SetStateAction<boolean>>
  hoveredObject: PickingInfo<Camera> | null
  setHoveredObject: Dispatch<SetStateAction<PickingInfo<Camera> | null>>
  selectedObject: Camera | null
  setSelectedObject: Dispatch<SetStateAction<Camera | null>>
  handleSelectObject: (camera: Camera | null, clearRadar?: () => void) => void
}

export function useCamera(): UseCamera {
  const [hoveredObject, setHoveredObject] =
    useState<PickingInfo<Camera> | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [selectedObject, setSelectedObject] = useState<Camera | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['cameras'],
    queryFn: () => getCamera(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const handleSelectObject = useCallback(
    (camera: Camera | null, clearRadar?: () => void) => {
      if (camera === null || selectedObject?.code === camera.code) {
        setSelectedObject(null)
      } else {
        if (clearRadar) {
          clearRadar()
        }
        setSelectedObject(camera)
      }
    },
    [selectedObject?.code, setSelectedObject],
  )

  const layer = useMemo(
    () =>
      new IconLayer<Camera>({
        id: 'cameras',
        data,
        pickable: true,
        getSize: 24,
        autoHighlight: true,
        highlightColor: [7, 76, 128, 250], // CIVITAS-dark-blue
        visible: isVisible,
        iconAtlas: cameraIconAtlas.src,
        iconMapping: {
          default: {
            x: 0,
            y: 0,
            width: 48,
            height: 48,
            mask: false,
          },
          highlighted: {
            x: 48,
            y: 0,
            width: 48,
            height: 48,
            mask: false,
          },
        },
        getIcon: (d) => {
          if (selectedObject?.code === d.code) {
            return 'highlighted'
          } else return 'default'
        },
        getPosition: (info) => [info.longitude, info.latitude],
      }),
    [data, selectedObject?.code, isVisible],
  )

  return {
    data: data || [],
    failed: !data && !isLoading,
    layer,
    isLoading,
    isVisible,
    setIsVisible,
    hoveredObject,
    setHoveredObject,
    selectedObject,
    setSelectedObject,
    handleSelectObject,
  }
}
