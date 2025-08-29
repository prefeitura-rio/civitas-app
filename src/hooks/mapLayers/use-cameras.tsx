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
import { getCameraCOR } from '@/http/cameras-cor/get-cameras-cor'
import { CameraCOR } from '@/models/entities'

export interface UseCameraCOR {
  data: CameraCOR[]
  failed: boolean
  layer: IconLayer<CameraCOR, object>
  isLoading: boolean
  isVisible: boolean
  setIsVisible: Dispatch<SetStateAction<boolean>>
  hoveredObject: PickingInfo<CameraCOR> | null
  setHoveredObject: Dispatch<SetStateAction<PickingInfo<CameraCOR> | null>>
  selectedObject: CameraCOR | null
  setSelectedObject: Dispatch<SetStateAction<CameraCOR | null>>
  handleSelectObject: (
    camera: CameraCOR | null,
    clearRadar?: () => void,
  ) => void
}

export function useCameraCOR(): UseCameraCOR {
  const [hoveredObject, setHoveredObject] =
    useState<PickingInfo<CameraCOR> | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [selectedObject, setSelectedObject] = useState<CameraCOR | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['cameras'],
    queryFn: () => getCameraCOR(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const handleSelectObject = useCallback(
    (camera: CameraCOR | null, clearRadar?: () => void) => {
      if (camera === null || selectedObject?.code === camera.code) {
        setSelectedObject(null)
      } else {
        // Limpa o radar selecionado se existir
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
      new IconLayer<CameraCOR>({
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
