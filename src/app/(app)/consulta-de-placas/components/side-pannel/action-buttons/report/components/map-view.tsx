/* eslint-disable jsx-a11y/alt-text */
import { Image } from '@react-pdf/renderer'

import { config } from '@/config'
import type { Point } from '@/utils/formatCarPathResponse'

interface MapViewProps {
  points: Point[]
}

export function MapView({ points }: MapViewProps) {
  const accessToken = config.mapboxAccessToken
  const mapStyle = 'mapbox/streets-v12'
  const mapWidth = '600'
  const mapHeight = '300'

  function createMarkerPart(point: Point) {
    const name = 'pin-s'
    const label = (point.index + 1).toString()
    const color = '000'
    const lon = point.from[0].toString()
    const lat = point.from[1].toString()

    return `${name}-${label}+${color}(${lon},${lat})`
  }

  const markers = points.reduce(
    (acc, cur) =>
      acc ? `${acc},${createMarkerPart(cur)}` : createMarkerPart(cur),
    '',
  )

  function createViewport(point: Point) {
    const lon = point.from[0].toString()
    const lat = point.from[1].toString()
    const zoom = '13.5'
    const bearing = '0'
    const pitch = '0'

    return `${lon},${lat},${zoom},${bearing},${pitch}`
  }

  const viewport = points.length > 1 ? 'auto' : createViewport(points[0])

  const mapboxUrl = `https://api.mapbox.com/styles/v1/${mapStyle}/static/${markers}/${viewport}/${mapWidth}x${mapHeight}?${points.length > 1 ? 'padding=50&' : ''}access_token=${accessToken}`

  return <Image src={mapboxUrl} style={{ paddingVertical: 20 }} />
}
