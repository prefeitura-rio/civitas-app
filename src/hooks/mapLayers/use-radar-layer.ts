'use client'
import { IconLayer, type PickingInfo } from 'deck.gl'
import { type Dispatch, type SetStateAction, useState } from 'react'

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
  handleSelectObject: (radar: Radar) => void
  selectedObjects: Radar[]
  setSelectedObjects: Dispatch<SetStateAction<Radar[]>>
}

export function useRadarLayer(): UseRadarLayer {
  const [hoveredObject, setHoveredObject] = useState<PickingInfo<Radar> | null>(
    null,
  )
  const [selectedObjects, setSelectedObjects] = useState<Radar[]>([])
  const [isVisible, setIsVisible] = useState(true)

  const { data } = useRadars()

  function handleSelectObject(radar: Radar) {
    if (selectedObjects.find((item) => item.cetRioCode === radar.cetRioCode)) {
      setSelectedObjects(
        selectedObjects.filter((item) => item.cetRioCode !== radar.cetRioCode),
      )
    } else {
      setSelectedObjects([radar, ...selectedObjects])
    }
  }

  const layer = new IconLayer<Radar>({
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
      if (
        selectedObjects.find((item) => item.cetRioCode === d.cetRioCode) &&
        d.activeInLast24Hours
      ) {
        return 'highlighted'
      }

      if (
        selectedObjects.find((item) => item.cetRioCode === d.cetRioCode) &&
        !d.activeInLast24Hours
      ) {
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
  })

  return {
    data,
    layer,
    hoveredObject,
    setHoveredObject,
    isVisible,
    setIsVisible,
    handleSelectObject,
    selectedObjects,
    setSelectedObjects,
  }
}
