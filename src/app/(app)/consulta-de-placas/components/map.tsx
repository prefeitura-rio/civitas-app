import { type PickingInfo } from '@deck.gl/core'
import { IconLayer, LineLayer, TextLayer } from '@deck.gl/layers'
import DeckGL from '@deck.gl/react'
import { useState } from 'react'
import ReactMalGL from 'react-map-gl'

import iconAtlas from '@/assets/icon-atlas.png'
import { config } from '@/config'
import { useCarPath } from '@/hooks/useCarPathContext'
import type { Point } from '@/utils/formatCarPathResponse'

import { IconTooltipCard } from './map/icon-tooltip-card'
import { LineTooltipCard } from './map/line-tooltip-card'
import { MapCaption } from './map/map-caption'

export function Map() {
  const { trips, viewport, setViewport, selectedTripIndex } = useCarPath()
  const [iconHoverInfo, setIconHoverInfo] = useState<PickingInfo<Point>>(
    {} as PickingInfo<Point>,
  )
  const [lineHoverInfo, setLineHoverInfo] = useState<PickingInfo<Point>>(
    {} as PickingInfo<Point>,
  )

  const points = trips?.at(selectedTripIndex)?.points

  const lineLayer = new LineLayer<Point>({
    id: 'line-layer',
    data: points,
    getSourcePosition: (point) => point.from,
    getTargetPosition: (point) => point.to || point.from,
    getColor: (point) => {
      const startTime = new Date(point.startTime)
      const endTime = new Date(point.endTime || point.startTime)

      const diff = (endTime.getTime() - startTime.getTime()) / 1000 / 60 // difference in minutes

      const percent = diff / 60

      const color1 = {
        red: 97,
        green: 175,
        blue: 239,
      }
      const color2 = {
        red: 238,
        green: 38,
        blue: 47,
      }

      const result = {
        red: color1.red + percent * (color2.red - color1.red),
        green: color1.green + percent * (color2.green - color1.green),
        blue: color1.blue + percent * (color2.blue - color1.blue),
      }

      return [result.red, result.green, result.blue]
    },
    getWidth: 3,
    pickable: true,
    onHover: (info) => setLineHoverInfo(info),
  })

  const lineLayerTransparent = new LineLayer<Point>({
    id: 'line-layer-transparent',
    data: points,
    getSourcePosition: (point) => point.from,
    getTargetPosition: (point) => point.to || point.from,
    getColor: [0, 0, 0, 0],
    getWidth: 30,
    pickable: true,
    onHover: (info) => setLineHoverInfo(info),
  })

  // Assuming icon_atlas has an arrow icon at the specified coordinates
  const ICON_MAPPING = {
    arrow: { x: 0, y: 0, width: 128, height: 128, anchorY: 128, mask: true },
  }

  const iconLayer = new IconLayer<Point>({
    id: 'icon-layer',
    data: points,
    getPosition: (point) => point.from,
    getColor: [0, 0, 0],
    getSize: 30,
    getIcon: () => 'arrow',
    iconAtlas: iconAtlas.src,
    iconMapping: ICON_MAPPING,
    pickable: true,
    onHover: (info) => setIconHoverInfo(info),
  })

  const textLayer = new TextLayer<Point>({
    id: 'text-layer',
    data: points,
    getPosition: (point) => point.from,
    getColor: [255, 255, 255],
    getSize: 15,
    getTextAnchor: 'middle',
    getText: (point) => String(point.index),
    fontWeight: 10,
    getPixelOffset: [0, -16],
    pickable: true,
    onHover: (info) => setIconHoverInfo(info),
  })

  return (
    <DeckGL
      initialViewState={viewport}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
      controller
      layers={[lineLayerTransparent, lineLayer, iconLayer, textLayer]}
      onViewStateChange={(e) => setViewport({ ...viewport, ...e.viewState })}
    >
      <ReactMalGL
        mapboxAccessToken={config.mapboxAccessToken}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      />
      <IconTooltipCard {...iconHoverInfo} />
      <LineTooltipCard {...lineHoverInfo} />
      <MapCaption />
    </DeckGL>
  )
}
