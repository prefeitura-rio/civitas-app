import { MapViewState } from '@deck.gl/core'
import { IconLayer, LineLayer, TextLayer } from '@deck.gl/layers'
import DeckGL from '@deck.gl/react'
import { useState } from 'react'
import ReactMalGL from 'react-map-gl'

import { config } from '@/config'
import { useCarPath } from '@/hooks/useCarPathContext'
import type { Point } from '@/utils/formatCarPathResponse'

type LineLayerDataType = {
  index: number
  from: [longitude: number, latidute: number]
  to: [longitude: number, latidute: number]
  startTime: string
  endTime: string
}

export function Map() {
  const { trips, viewport, setViewport, selectedTripIndex } = useCarPath()

  const points = trips?.at(selectedTripIndex)?.points

  // const lineLayerData: LineLayerDataType[] = [
  //   {
  //     index: 1,
  //     from: [-43.3863970006, -22.9437190008],
  //     startTime: '2024-06-12T08:42:56-03:00',
  //     to: [-43.3761100006, -22.9544990008],
  //     endTime: '2024-06-12T08:54:11-03:00',
  //   },
  //   {
  //     index: 2,
  //     from: [-43.3761100006, -22.9544990008],
  //     to: [-43.37018172686272, -22.937457863536597],
  //     startTime: '2024-06-12T08:54:11-03:00',
  //     endTime: '2024-06-12T08:59:50-03:00',
  //   },
  //   {
  //     index: 3,
  //     from: [-43.37018172686272, -22.937457863536597],
  //     to: [-43.3142030006, -22.8883510008],
  //     startTime: '2024-06-12T08:59:50-03:00',
  //     endTime: '2024-06-12T09:37:30-03:00',
  //   },
  //   {
  //     index: 4,
  //     from: [-43.3142030006, -22.8883510008],
  //     to: [-43.3142030006, -22.8883510008],
  //     startTime: '2024-06-12T09:37:30-03:00',
  //     endTime: '2024-06-12T09:37:30-03:00',
  //   },
  // ]

  console.log(points)

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
    getWidth: 2,
  })

  const iconLayer = new IconLayer<LineLayerDataType>({
    id: 'icon-layer',
    data: points,
    getPosition: (point) => {
      console.log({ point })
      return point.from
    },
    getColor: [0, 0, 0],
    getSize: 40,
    getIcon: (point) => 'marker',
    pickable: true,
    iconAtlas:
      'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
    iconMapping:
      'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
  })

  const textLayer = new TextLayer<LineLayerDataType>({
    id: 'text-layer',
    data: points,
    getPosition: (point) => point.from,
    getColor: [0, 0, 0],
    getSize: 20,
    getTextAnchor: 'middle',
    getText: (point) => String(point.index),
    pickable: true,
    fontWeight: 10,
    getPixelOffset: [0, -21],
  })

  return (
    <DeckGL
      initialViewState={viewport}
      style={{ position: 'relative', width: '100%', height: '100%' }}
      controller
      layers={[lineLayer, iconLayer, textLayer]}
      onViewStateChange={(e) => setViewport({ ...viewport, ...e.viewState })}
    >
      <ReactMalGL
        mapboxAccessToken={config.mapboxAccessToken}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        // style={{ height: '!0px', width: '!0px' }}
      />
    </DeckGL>
  )
}
