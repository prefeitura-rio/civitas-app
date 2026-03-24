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
  dc3Layer: IconLayer<Camera, object>
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

  const iconMapping = {
    default: { x: 0, y: 0, width: 48, height: 48, mask: false },
    highlighted: { x: 48, y: 0, width: 48, height: 48, mask: false },
    'dc3-default': { x: 0, y: 48, width: 48, height: 48, mask: false },
    'dc3-highlighted': { x: 48, y: 48, width: 48, height: 48, mask: false },
  }

  const sharedProps = {
    pickable: true,
    getSize: 24,
    visible: isVisible,
    iconAtlas: cameraIconAtlas.src,
    iconMapping,
    getPosition: (d: Camera) => [d.longitude, d.latitude] as [number, number],
    onHover: (info: PickingInfo<Camera>) => {
      setHoveredObject(info.object ? info : null)
    },
  }

  // Câmeras comuns (azul) — renderizadas primeiro (abaixo)
  const layer = useMemo(
    () =>
      new IconLayer<Camera>({
        ...sharedProps,
        id: 'cameras',
        data: data?.filter((d) => d.sistemaOrigem?.toUpperCase() !== 'DC3'),
        getIcon: (d) => {
          const isActive =
            selectedObject?.code === d.code ||
            hoveredObject?.object?.code === d.code
          return isActive ? 'highlighted' : 'default'
        },
      }),
    [data, selectedObject?.code, hoveredObject?.object?.code, isVisible],
  )

  // Câmeras DC3 (verde) — renderizadas depois (por cima)
  const dc3Layer = useMemo(
    () =>
      new IconLayer<Camera>({
        ...sharedProps,
        id: 'cameras-dc3',
        data: data?.filter((d) => d.sistemaOrigem?.toUpperCase() === 'DC3'),
        getIcon: (d) => {
          const isActive =
            selectedObject?.code === d.code ||
            hoveredObject?.object?.code === d.code
          return isActive ? 'dc3-highlighted' : 'dc3-default'
        },
      }),
    [data, selectedObject?.code, hoveredObject?.object?.code, isVisible],
  )

  return {
    data: data || [],
    failed: !data && !isLoading,
    layer,
    dc3Layer,
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
