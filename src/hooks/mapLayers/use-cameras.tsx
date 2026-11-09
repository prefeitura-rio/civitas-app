import type { PickingInfo } from '@deck.gl/core'
import { IconLayer, type ScatterplotLayer } from '@deck.gl/layers'
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
import type { Camera } from '@/models/entities'
import { getCoincidentPointOffsets } from '@/utils/coincident-point-offsets'
import { getCameraOrigin } from '@/utils/collection-point-origin'
import {
  createRightClickRingLayer,
  POINT_LAYER_IDS,
} from '@/utils/point-layer-config'

import { type OriginFilter, useOriginFilter } from './use-origin-filter'

const EMPTY_CAMERAS: Camera[] = []
const getCameraPointOrigin = (point: Camera) =>
  getCameraOrigin(point.sistemaOrigem)

export interface UseCamera extends OriginFilter<Camera> {
  data: Camera[]
  failed: boolean
  layer: IconLayer<Camera, object>
  highlightLayer: ScatterplotLayer<[number, number]> | null
  isLoading: boolean
  isVisible: boolean
  setIsVisible: Dispatch<SetStateAction<boolean>>
  hoveredObject: PickingInfo<Camera> | null
  setHoveredObject: Dispatch<SetStateAction<PickingInfo<Camera> | null>>
  selectedObject: Camera | null
  setSelectedObject: Dispatch<SetStateAction<Camera | null>>
  handleSelectObject: (camera: Camera | null, clearRadar?: () => void) => void
}

/**
 * Renders cameras in one color, filtered by camera system.
 * Hover and selection invalidate icon attributes without rebuilding geographic data.
 */
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

  const originFilter = useOriginFilter(data, getCameraPointOrigin)
  const offsets = useMemo(
    () =>
      getCoincidentPointOffsets(data ?? EMPTY_CAMERAS, (point) => [
        point.longitude,
        point.latitude,
      ]),
    [data],
  )

  const handleSelectObject = useCallback(
    (camera: Camera | null, clearRadar?: () => void) => {
      if (camera === null) {
        setSelectedObject(null)
      } else {
        if (clearRadar) {
          clearRadar()
        }
        setSelectedObject(camera)
      }
    },
    [setSelectedObject],
  )

  const iconMapping = {
    default: { x: 0, y: 0, width: 48, height: 48, mask: false },
    highlighted: { x: 48, y: 0, width: 48, height: 48, mask: false },
  }

  const layer = useMemo(
    () =>
      new IconLayer<Camera>({
        id: POINT_LAYER_IDS.cameras,
        data: originFilter.visibleData,
        pickable: true,
        getSize: 24,
        visible: isVisible,
        iconAtlas: cameraIconAtlas.src,
        iconMapping,
        updateTriggers: {
          getIcon: [selectedObject?.code, hoveredObject?.object?.code],
          getPosition: offsets,
        },
        getPosition: (d: Camera) =>
          offsets.get(d) ?? ([d.longitude, d.latitude] as [number, number]),
        onHover: (info: PickingInfo<Camera>) => {
          setHoveredObject(info.object ? info : null)
        },
        getIcon: (d) => {
          const isHovered = hoveredObject?.object?.code === d.code
          return isHovered ? 'highlighted' : 'default'
        },
      }),
    [
      originFilter.visibleData,
      offsets,
      selectedObject?.code,
      hoveredObject?.object?.code,
      isVisible,
    ],
  )

  const selectedPosition = useMemo<[number, number] | null>(() => {
    if (!selectedObject) return null
    const matching = (data ?? EMPTY_CAMERAS).find(
      (item) => item.code === selectedObject.code,
    )
    const target = matching ?? selectedObject
    return offsets.get(target) ?? [target.longitude, target.latitude]
  }, [data, offsets, selectedObject])

  const highlightLayer = useMemo(
    () =>
      createRightClickRingLayer(
        `${POINT_LAYER_IDS.cameras}-right-click-highlight`,
        selectedPosition,
        isVisible,
      ),
    [selectedPosition, isVisible],
  )

  return {
    ...originFilter,
    data: data ?? EMPTY_CAMERAS,
    failed: !data && !isLoading,
    layer,
    highlightLayer,
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
