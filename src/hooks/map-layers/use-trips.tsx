import type { PickingInfo } from '@deck.gl/core'
import { IconLayer, LineLayer, TextLayer } from '@deck.gl/layers'
import { type Dispatch, type SetStateAction, useState } from 'react'

import iconAtlas from '@/assets/icon-atlas.png'
import type { Point } from '@/models/entities'
import { calculateColorInGradient } from '@/utils/calculate-color-gradient'

import {
  type UseTripsData,
  useTripsData,
  type UseTripsProps,
} from './use-trips-data'

export interface UseTrips extends UseTripsData {
  layers: {
    textLayer: TextLayer<Point, object>
    coloredIconLayer: IconLayer<Point, object>
    blackIconLayer: IconLayer<Point, object>
    lineLayerTransparent: LineLayer<Point, object>
    lineLayer: LineLayer<Point, object>
  }
  layersState: {
    iconHoverInfo: PickingInfo<Point>
    setIconHoverInfo: Dispatch<SetStateAction<PickingInfo<Point>>>
    lineHoverInfo: PickingInfo<Point>
    setLineHoverInfo: Dispatch<SetStateAction<PickingInfo<Point>>>
    isLinesEnabled: boolean
    setIsLinesEnabled: Dispatch<SetStateAction<boolean>>
    isIconColorEnabled: boolean
    setIsIconColorEnabled: Dispatch<SetStateAction<boolean>>
  }
}

export function useTrips({ setViewport }: UseTripsProps): UseTrips {
  const [iconHoverInfo, setIconHoverInfo] = useState<PickingInfo<Point>>(
    {} as PickingInfo<Point>,
  )
  const [lineHoverInfo, setLineHoverInfo] = useState<PickingInfo<Point>>(
    {} as PickingInfo<Point>,
  )
  const [isLinesEnabled, setIsLinesEnabled] = useState(false)
  const [isIconColorEnabled, setIsIconColorEnabled] = useState(false)

  // Assuming icon_atlas has an arrow icon at the specified coordinates
  const ICON_MAPPING = {
    arrow: { x: 0, y: 0, width: 128, height: 128, anchorY: 128, mask: true },
  }

  const trips = useTripsData({ setViewport })

  const points = trips.selectedTrip?.points

  const lineLayer = new LineLayer<Point>({
    id: 'line-layer',
    data: points,
    getSourcePosition: (point) => point.from,
    getTargetPosition: (point) => point.to || point.from,
    getColor: calculateColorInGradient,
    getWidth: 3,
    pickable: true,
    onHover: (info) => setLineHoverInfo(info),
    visible: isLinesEnabled,
  })

  const lineLayerTransparent = new LineLayer<Point>({
    id: 'line-layer-transparent',
    data: points,
    getSourcePosition: (info) => info.from,
    getTargetPosition: (info) => info.to || info.from,
    getColor: [0, 0, 0, 0],
    getWidth: 30,
    pickable: true,
    onHover: (info) => setLineHoverInfo(info),
    visible: isLinesEnabled,
  })

  const blackIconLayer = new IconLayer<Point>({
    id: 'black-icon-layer',
    data: points,
    getPosition: (info) => info.from,
    getColor: [0, 0, 0],
    getSize: 30,
    getIcon: () => 'arrow',
    iconAtlas: iconAtlas.src,
    iconMapping: ICON_MAPPING,
    pickable: true,
    onHover: (info) => setIconHoverInfo(info),
    visible: !isIconColorEnabled,
  })

  const coloredIconLayer = new IconLayer<Point>({
    id: 'colored-icon-layer',
    data: points,
    getPosition: (info) => info.from,
    getColor: (info) => (info.to ? calculateColorInGradient(info) : [0, 0, 0]),
    getSize: 30,
    getIcon: () => 'arrow',
    iconAtlas: iconAtlas.src,
    iconMapping: ICON_MAPPING,
    pickable: true,
    onHover: (info) => setIconHoverInfo(info),
    visible: isIconColorEnabled,
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
    onHover: (info) => setIconHoverInfo(info),
  })

  return {
    ...trips,
    layers: {
      textLayer,
      coloredIconLayer,
      blackIconLayer,
      lineLayerTransparent,
      lineLayer,
    },
    layersState: {
      iconHoverInfo,
      setIconHoverInfo,
      lineHoverInfo,
      setLineHoverInfo,
      isLinesEnabled,
      setIsLinesEnabled,
      isIconColorEnabled,
      setIsIconColorEnabled,
    },
  }
}
