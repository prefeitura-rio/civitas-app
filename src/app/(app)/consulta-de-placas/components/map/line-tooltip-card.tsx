import type { PickingInfo } from '@deck.gl/core'

import { Card } from '@/components/ui/card'
import type { Point } from '@/utils/formatCarPathResponse'

import { IconTooltipInfo } from './icon-tooltip-info'

export function LineTooltipCard({ x, y, object }: PickingInfo<Point>) {
  const diffInSeconds = object?.secondsToNextPoint || 0
  console.log({ diffInSeconds })
  const diffInMinutes = diffInSeconds / 60
  console.log({ diffInMinutes })
  return (
    <>
      {object && (
        <Card
          style={{ left: x, top: y, zIndex: 1 }}
          className="pointer-events-none absolute min-w-40 max-w-96 px-3 py-2"
        >
          <IconTooltipInfo
            label="Intervalo"
            value={String(diffInMinutes.toFixed(0)) + ' min'}
          />
        </Card>
      )}
    </>
  )
}
