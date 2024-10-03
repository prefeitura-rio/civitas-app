'use client'
import { type PickingInfo, WebMercatorViewport } from '@deck.gl/core'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import type {
  Agent,
  CameraCOR,
  FogoCruzadoIncident,
  Point,
  Radar,
  Report,
  WazeAlert,
} from '@/models/entities'

import { Card } from '../ui/card'

interface MapHoverCardProps {
  children?: ReactNode
  hoveredObject: PickingInfo<
    CameraCOR | Radar | FogoCruzadoIncident | Agent | WazeAlert | Report | Point
  > | null
  className?: string
}
export function MapHoverCard({
  hoveredObject,
  children,
  className,
}: MapHoverCardProps) {
  const getPixelPosition = (longitude: number, latitude: number) => {
    const mercatorViewport = new WebMercatorViewport(hoveredObject?.viewport)
    const [x, y] = mercatorViewport.project([longitude, latitude])
    return [x, y]
  }

  const viewport = hoveredObject?.viewport

  const obj = hoveredObject?.object

  const lon =
    obj && 'longitude' in obj
      ? obj?.longitude || 0
      : obj && 'from' in obj
        ? obj.from[0]
        : 0
  const lat =
    obj && 'latitude' in obj
      ? obj?.latitude || 0
      : obj && 'from' in obj
        ? obj.from[1]
        : 0

  const x = getPixelPosition(lon, lat)[0]
  const y = getPixelPosition(lon, lat)[1]

  const left = x < (viewport?.width || 0) / 2 ? x + 5 : undefined
  const top = y < (viewport?.height || 0) / 2 ? y : undefined
  const right =
    x > (viewport?.width || 0) / 2 ? (viewport?.width || 0) - x + 5 : undefined
  const bottom =
    y > (viewport?.height || 0) / 2 ? (viewport?.height || 0) - y : undefined

  return (
    <Card
      style={{ left, top, bottom, right }}
      className={cn(
        'absolute w-96 px-3 py-2',
        hoveredObject && hoveredObject.object ? '' : 'hidden',
        className,
      )}
    >
      {children}
    </Card>
  )
}
