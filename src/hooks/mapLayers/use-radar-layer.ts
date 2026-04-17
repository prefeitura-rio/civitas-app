'use client'
import { IconLayer, type PickingInfo } from 'deck.gl'
import { useCallback, useMemo, useState } from 'react'

import radarIconAtlas from '@/assets/radar-icon-atlas.png'
import type { CollectionPoint } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'

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

  const iconMapping = {
    default: { x: 0, y: 0, width: 48, height: 48, mask: false },
    disabled: { x: 0, y: 48, width: 48, height: 48, mask: false },
    highlighted: { x: 48, y: 0, width: 48, height: 48, mask: false },
    'disabled-highlighted': {
      x: 48,
      y: 48,
      width: 48,
      height: 48,
      mask: false,
    },
    // SENTRY: variantes violetas (y 96 e 144)
    'sentry-default': { x: 0, y: 96, width: 48, height: 48, mask: false },
    'sentry-highlighted': { x: 48, y: 96, width: 48, height: 48, mask: false },
    'sentry-disabled': { x: 0, y: 144, width: 48, height: 48, mask: false },
    'sentry-disabled-highlighted': {
      x: 48,
      y: 144,
      width: 48,
      height: 48,
      mask: false,
    },
  }

  const sharedProps = {
    pickable: true,
    sizeScale: 24,
    iconAtlas: radarIconAtlas.src,
    iconMapping,
    getColor: (): [number, number, number] => [240, 140, 10],
    getPosition: (d: CollectionPoint) =>
      [d.longitude, d.latitude] as [number, number],
    visible: isVisible,
    onHover: (info: PickingInfo<CollectionPoint>) => {
      setHoveredObject(info.object ? info : null)
    },
  }

  const getRadarIcon = (d: CollectionPoint, prefix: '' | 'sentry-') => {
    const isSelected = selectedObject?.cetRioCode === d.cetRioCode
    const isMultiSelected = selectedObjects.some(
      (item) => item.cetRioCode === d.cetRioCode,
    )
    const isHovered = hoveredObject?.object?.cetRioCode === d.cetRioCode

    if ((isSelected || isMultiSelected || isHovered) && d.activeInLast24Hours) {
      return `${prefix}highlighted`
    }
    if (
      (isSelected || isMultiSelected || isHovered) &&
      !d.activeInLast24Hours
    ) {
      return `${prefix}disabled-highlighted`
    }
    if (!d.activeInLast24Hours) {
      return `${prefix}disabled`
    }
    return `${prefix}default`
  }

  const deps = [
    data,
    selectedObject?.cetRioCode,
    selectedObjects,
    hoveredObject?.object?.cetRioCode,
    isVisible,
    multipleSelectedRadars,
  ] as const

  // Radares comuns (laranja) — renderizados primeiro (abaixo)
  const layer = useMemo(
    () =>
      new IconLayer<CollectionPoint>({
        ...sharedProps,
        id: 'radars',
        data: data?.filter((d) => d.company?.toUpperCase() !== 'CIVITAS'),
        getIcon: (d) => getRadarIcon(d, ''),
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
        getIcon: (d) => getRadarIcon(d, 'sentry-'),
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
