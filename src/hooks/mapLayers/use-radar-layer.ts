'use client'
import { IconLayer, type PickingInfo } from 'deck.gl'
import { useCallback, useMemo, useState } from 'react'

import type { CollectionPoint } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'
import {
  getCollectionPointIcon,
  RADAR_ICON_MAPPING,
  radarIconAtlas,
} from '@/utils/collection-point-icons'

import { useCollectionPoints } from '../useQueries/useCollectionPoints'

export interface UseRadarLayer {
  data: CollectionPoint[] | undefined
  layer: IconLayer<CollectionPoint>
  sentryLayer: IconLayer<CollectionPoint>
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
    iconAtlas: radarIconAtlas.src,
    iconMapping: RADAR_ICON_MAPPING,
    getColor: (): [number, number, number] => [240, 140, 10],
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

  const getRadarIcon = (d: CollectionPoint) => {
    const isSelected = selectedObject?.cetRioCode === d.cetRioCode
    const isMultiSelected = selectedObjects.some(
      (item) => item.cetRioCode === d.cetRioCode,
    )
    const isHovered = hoveredObject?.object?.cetRioCode === d.cetRioCode

    return getCollectionPointIcon(d, isSelected || isMultiSelected || isHovered)
  }

  const deps = [
    data,
    selectedObject?.cetRioCode,
    selectedObjects,
    hoveredObject?.object?.cetRioCode,
    isVisible,
    multipleSelectedRadars,
  ] as const

  // CETRIO (laranja) e GABRIEL (verde) — renderizados primeiro (abaixo)
  const layer = useMemo(
    () =>
      new IconLayer<CollectionPoint>({
        ...sharedProps,
        id: 'radars',
        data: data?.filter((d) => d.company?.toUpperCase() !== 'CIVITAS'),
        getIcon: getRadarIcon,
      }),
    [...deps],
  )

  // Radares SENTRY (violeta) — renderizados depois (por cima)
  const sentryLayer = useMemo(
    () =>
      new IconLayer<CollectionPoint>({
        ...sharedProps,
        id: 'radars-sentry',
        data: data?.filter((d) => d.company?.toUpperCase() === 'CIVITAS'),
        getIcon: getRadarIcon,
      }),
    [...deps],
  )

  return {
    data,
    layer,
    sentryLayer,
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
