import type { Viewport } from '@deck.gl/core'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Card } from '../ui/card'

interface MapHoverCardProps {
  viewport: Viewport | undefined
  x: number
  y: number
  children: ReactNode
  object: unknown
  className?: string
}
export function MapHoverCard({
  viewport,
  x,
  y,
  children,
  object,
  className,
}: MapHoverCardProps) {
  const left = x < (viewport?.width || 0) / 2 ? x : undefined
  const top = y < (viewport?.height || 0) / 2 ? y : undefined
  const right =
    x > (viewport?.width || 0) / 2 ? (viewport?.width || 0) - x : undefined
  const bottom =
    y > (viewport?.height || 0) / 2 ? (viewport?.height || 0) - y : undefined
  return (
    <Card
      style={{ left, top, bottom, right, zIndex: 1 }}
      className={cn(
        'pointer-events-none absolute w-96 px-3 py-2',
        object ? '' : 'hidden',
        className,
      )}
    >
      {children}
    </Card>
  )
}
