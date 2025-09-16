import type { PickingInfo } from '@deck.gl/core'
import { IconLayer, TextLayer } from '@deck.gl/layers'
import { type Dispatch, type SetStateAction, useState } from 'react'

import iconAtlas from '@/assets/icon-atlas.png'
import type { Point } from '@/models/entities'

import {
  type UseTripsData,
  useTripsData,
  type UseTripsProps,
} from './use-trips-data'

export interface UseTrips extends UseTripsData {
  layers: [
    iconLayer: IconLayer<Point, object>,
    textLayer: TextLayer<Point, object>,
  ]
  hoveredObject: PickingInfo<Point> | null
  setHoveredObject: Dispatch<SetStateAction<PickingInfo<Point> | null>>
  setIsHoveringInfoCard: Dispatch<SetStateAction<boolean>>
  isVisible: boolean
  setIsVisible: Dispatch<SetStateAction<boolean>>
}

export function useTrips({ setViewport }: UseTripsProps): UseTrips {
  const [hoveredObject, setHoveredObject] = useState<PickingInfo<Point> | null>(
    null,
  )
  const [isHoveringInfoCard, setIsHoveringInfoCard] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Assuming icon_atlas has an arrow icon at the specified coordinates
  const ICON_MAPPING = {
    arrow: { x: 0, y: 0, width: 128, height: 128, anchorY: 128, mask: true },
  }

  const trips = useTripsData({ setViewport })

  const points = trips.selectedTrip?.points

  const iconLayer = new IconLayer<Point>({
    id: 'black-icon-layer',
    data: points,
    getPosition: (info) => info.from,
    getColor: [0, 0, 0],
    getSize: 30,
    getIcon: () => 'arrow',
    iconAtlas: iconAtlas.src,
    iconMapping: ICON_MAPPING,
    pickable: true,
    onHover: (info) => {
      if (!isHoveringInfoCard) {
        setHoveredObject(info.object ? info : null)
      }
    },
    visible: !isVisible,
  })

  const textLayer = new TextLayer<Point>({
    id: 'text-layer',
    data: points,
    getPosition: (info) => info.from,
    getColor: [255, 255, 255],
    getSize: 15,
    getTextAnchor: 'middle',
    getText: (info) => String(info.index + 1),
    fontWeight: 10,
    getPixelOffset: [0, -16],
    pickable: true,
    onHover: (info) => setHoveredObject(info),
  })

  return {
    ...trips,
    layers: [iconLayer, textLayer],
    hoveredObject,
    setIsHoveringInfoCard,
    setHoveredObject,
    isVisible,
    setIsVisible,
  }
}
