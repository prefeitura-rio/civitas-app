'use client'
import { IconLayer, type PickingInfo } from 'deck.gl'
import { useCallback, useMemo, useState } from 'react'

import type { CollectionPoint } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'
import {
  COLLECTION_POINT_ICON_MAPPING,
  collectionPointIconAtlas,
  getCollectionPointIcon,
} from '@/utils/collection-point-icons'
import { getCollectionPointOrigin } from '@/utils/collection-point-origin'
import { POINT_LAYER_IDS } from '@/utils/point-layer-config'

import { useCollectionPoints } from '../useQueries/useCollectionPoints'
import { type OriginFilter, useOriginFilter } from './use-origin-filter'

const getRadarOrigin = (point: CollectionPoint) =>
  getCollectionPointOrigin(point.company)

export interface UseRadarLayer extends OriginFilter<CollectionPoint> {
  data: CollectionPoint[] | undefined
  layer: IconLayer<CollectionPoint>
  hoveredObject: PickingInfo<CollectionPoint> | null
  setHoveredObject: (value: PickingInfo<CollectionPoint> | null) => void
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  handleSelectObject: (radar: CollectionPoint, clearCamera?: () => void) => void
  handleMultiSelectObject: (radar: CollectionPoint) => void
  selectedObject: CollectionPoint | null
  setSelectedObject: (radar: CollectionPoint | null) => void
  selectedObjects: CollectionPoint[]
  setSelectedObjects: (
    radars:
      | CollectionPoint[]
      | ((prev: CollectionPoint[]) => CollectionPoint[]),
  ) => void
  multipleSelectedRadars?: string[]
}

/**
 * Renders LPR points while retaining geographic data references through visual changes.
 * Query-data and origin-filter updates replace the data; hover and selection only update icons.
 * @param multipleSelectedRadars - Selected collection-point codes from the map store.
 */
export function useRadarLayer(
  multipleSelectedRadars: string[] = [],
): UseRadarLayer {
  const [hoveredObject, setHoveredObject] =
    useState<PickingInfo<CollectionPoint> | null>(null)
  const [selectedObject, setSelectedObject] = useState<CollectionPoint | null>(
    null,
  )
  const [isVisible, setIsVisible] = useState(true)

  const { data } = useCollectionPoints()
  const originFilter = useOriginFilter(data, getRadarOrigin)

  const setMultipleSelectedRadars = useMapStore(
    (state) => state.setMultipleSelectedRadars,
  )

  const selectedObjects = useMemo(() => {
    if (!data || !multipleSelectedRadars.length) return []
    return data.filter((radar) =>
      multipleSelectedRadars.includes(radar.cetRioCode),
    )
  }, [data, multipleSelectedRadars])

  const setSelectedObjects = useCallback(
    (
      radarsOrUpdater:
        | CollectionPoint[]
        | ((prev: CollectionPoint[]) => CollectionPoint[]),
    ) => {
      const newRadars =
        typeof radarsOrUpdater === 'function'
          ? radarsOrUpdater(selectedObjects)
          : radarsOrUpdater
      const newCodes = newRadars.map((radar) => radar.cetRioCode)
      setMultipleSelectedRadars(newCodes)
    },
    [selectedObjects, setMultipleSelectedRadars],
  )

  const handleSelectObject = useCallback(
    (radar: CollectionPoint, clearCamera?: () => void) => {
      if (selectedObject?.cetRioCode === radar.cetRioCode) {
        setSelectedObject(null)
      } else {
        if (clearCamera) {
          clearCamera()
        }
        setSelectedObject(radar)
      }
    },
    [selectedObject?.cetRioCode, setSelectedObject],
  )

  const handleMultiSelectObject = useCallback(
    (radar: CollectionPoint) => {
      setMultipleSelectedRadars((currentCodes) => {
        const radarCode = radar.cetRioCode

        if (currentCodes.includes(radarCode)) {
          return currentCodes.filter((code) => code !== radarCode)
        } else {
          return [radarCode, ...currentCodes]
        }
      })
    },
    [setMultipleSelectedRadars, selectedObjects],
  )

  const sharedProps = {
    pickable: true,
    sizeScale: 24,
    iconAtlas: collectionPointIconAtlas.src,
    iconMapping: COLLECTION_POINT_ICON_MAPPING,
    getIcon: getRadarIcon,
    getPosition: (d: CollectionPoint) =>
      [d.longitude, d.latitude] as [number, number],
    visible: isVisible,
    updateTriggers: {
      getIcon: [
        selectedObject?.cetRioCode,
        selectedObjects,
        hoveredObject?.object?.cetRioCode,
      ],
    },
    onHover: (info: PickingInfo<CollectionPoint>) => {
      setHoveredObject(info.object ? info : null)
    },
  }

  function getRadarIcon(d: CollectionPoint) {
    const isSelected = selectedObject?.cetRioCode === d.cetRioCode
    const isMultiSelected = selectedObjects.some(
      (item) => item.cetRioCode === d.cetRioCode,
    )
    const isHovered = hoveredObject?.object?.cetRioCode === d.cetRioCode

    return getCollectionPointIcon(d, isSelected || isMultiSelected || isHovered)
  }

  const layer = useMemo(
    () =>
      new IconLayer<CollectionPoint>({
        ...sharedProps,
        id: POINT_LAYER_IDS.radars,
        data: originFilter.visibleData,
      }),
    [
      originFilter.visibleData,
      selectedObject?.cetRioCode,
      selectedObjects,
      hoveredObject?.object?.cetRioCode,
      isVisible,
      multipleSelectedRadars,
    ],
  )

  return {
    ...originFilter,
    data,
    layer,
    hoveredObject,
    setHoveredObject,
    isVisible,
    setIsVisible,
    handleSelectObject,
    handleMultiSelectObject,
    selectedObject,
    setSelectedObject,
    selectedObjects,
    setSelectedObjects,
    multipleSelectedRadars,
  }
}
