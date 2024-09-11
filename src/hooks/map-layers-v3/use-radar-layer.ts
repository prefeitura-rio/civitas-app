import { IconLayer, type PickingInfo } from 'deck.gl'
import { useState } from 'react'

import radarAtlas from '@/assets/radar-icon.png'
import type { Radar } from '@/models/entities'

import { useRadars } from '../use-queries/use-radars'

export function useRadarLayer() {
  const [hoveredObject, setHoveredObject] = useState<PickingInfo<Radar> | null>(
    null,
  )
  const [isHoveringInfoCard, setIsHoveringInfoCard] = useState(false)
  const [clickedObject, setClickedObject] = useState<PickingInfo<Radar> | null>(
    null,
  )
  const [selectedObjects, setSelectedObjects] = useState<Radar[]>([])
  const [isVisible, setIsVisible] = useState(true)

  const { data } = useRadars()

  function handleSelectObject(radar: Radar) {
    if (
      selectedObjects.find((item) => item.cameraNumber === radar.cameraNumber)
    ) {
      setSelectedObjects(
        selectedObjects.filter(
          (item) => item.cameraNumber !== radar.cameraNumber,
        ),
      )
    } else {
      setSelectedObjects([...selectedObjects, radar])
    }
  }

  const layer = new IconLayer<Radar>({
    id: 'radars',
    data,
    pickable: true,
    iconAtlas: radarAtlas.src,
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
        selectedObjects.find((item) => item.cameraNumber === d.cameraNumber)
      ) {
        return 'highlighted'
      } else return 'default'
    },
    sizeScale: 24,
    getPosition: (d) => [d.longitude, d.latitude],
    getColor: () => [240, 140, 10],
    visible: isVisible,
    onHover: (info) => {
      if (!isHoveringInfoCard) {
        setHoveredObject(info.object ? info : null)
      }
    },
    onClick: (info) => {
      if (info.object) {
        handleSelectObject(info.object)
      }
    },
    autoHighlight: true,
    highlightColor: [249, 115, 22],
  })

  return {
    data,
    layer,
    hoveredObject,
    clickedObject,
    isVisible,
    setIsVisible,
    handleSelectObject,
    setClickedObject,
    isHoveringInfoCard,
    setIsHoveringInfoCard,
  }
}
