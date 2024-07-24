import type { PickingInfo } from '@deck.gl/core'

import { Card } from '@/components/ui/card'
import type { Point } from '@/models/entities'

import { TooltipInfoItem } from './tooltip-info-item'

export function LineTooltipCard({ x, y, object }: PickingInfo<Point>) {
  const diffInSeconds = object?.secondsToNextPoint || 0
  const diffInMinutes = diffInSeconds / 60

  return (
    <>
      {object && (
        <Card
          style={{ left: x, top: y, zIndex: 1 }}
          className="pointer-events-none absolute min-w-40 max-w-96 px-3 py-2"
        >
          <TooltipInfoItem
            label="Intervalo"
            value={String(diffInMinutes.toFixed(0)) + ' min'}
          />
        </Card>
      )}
    </>
  )
}
