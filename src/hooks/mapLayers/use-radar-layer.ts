'use client'
import { IconLayer, type PickingInfo } from 'deck.gl'
import { useCallback, useMemo, useState } from 'react'

import radarIconAtlas from '@/assets/radar-icon-atlas.png'
import type { Radar } from '@/models/entities'

import { useRadars } from '../useQueries/useRadars'

export interface UseRadarLayer {
  data: Radar[] | undefined
  layer: IconLayer<Radar>
  hoveredObject: PickingInfo<Radar> | null
  setHoveredObject: (value: PickingInfo<Radar> | null) => void
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  handleSelectObject: (radar: Radar, clearCamera?: () => void) => void
  selectedObject: Radar | null
  setSelectedObject: (radar: Radar | null) => void
  multipleSelectedRadars?: string[]
}

export function useRadarLayer(
  multipleSelectedRadars: string[] = [],
): UseRadarLayer {
  const [hoveredObject, setHoveredObject] = useState<PickingInfo<Radar> | null>(
    null,
  )
  const [selectedObject, setSelectedObject] = useState<Radar | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  const { data } = useRadars()

  const handleSelectObject = useCallback(
    (radar: Radar, clearCamera?: () => void) => {
      // Se o radar já está selecionado, deseleciona
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

  const layer = useMemo(
    () =>
      new IconLayer<Radar>({
        id: 'radars',
        data,
        pickable: true,
        iconAtlas: radarIconAtlas.src,
        iconMapping: {
          default: {
            x: 0,
            y: 0,
            width: 48,
            height: 48,
            mask: false,
          },
          disabled: {
            x: 0,
            y: 48,
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
          'disabled-highlighted': {
            x: 48,
            y: 48,
            width: 48,
            height: 48,
            mask: false,
          },
        },
        getIcon: (d) => {
          const isSelected = selectedObject?.cetRioCode === d.cetRioCode
          const isMultiSelected = multipleSelectedRadars.includes(d.cetRioCode)

          if ((isSelected || isMultiSelected) && d.activeInLast24Hours) {
            return 'highlighted'
          }

          if ((isSelected || isMultiSelected) && !d.activeInLast24Hours) {
            return 'disabled-highlighted'
          }

          if (!d.activeInLast24Hours) {
            return 'disabled'
          }

          return 'default'
        },
        sizeScale: 24,
        getPosition: (d) => [d.longitude, d.latitude],
        getColor: () => [240, 140, 10],
        visible: isVisible,
        // onHover: (info) => {
        //   if (!isHoveringInfoCard) {
        //     setHoveredObject(info.object ? info : null)
        //   }
        // },
        // onClick: (info) => {
        //   if (info.object) {
        //     handleSelectObject(info.object)
        //   }
        // },
        autoHighlight: true,
        highlightColor: [249, 115, 22],
      }),
    [data, selectedObject?.cetRioCode, isVisible, multipleSelectedRadars],
  )

  return {
    data,
    layer,
    hoveredObject,
    setHoveredObject,
    isVisible,
    setIsVisible,
    handleSelectObject,
    selectedObject,
    setSelectedObject,
    multipleSelectedRadars,
  }
}
