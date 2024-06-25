import type { PickingInfo } from '@deck.gl/core'
import { format } from 'date-fns'

import { Card } from '@/components/ui/card'
import type { Point } from '@/utils/formatCarPathResponse'

import { IconTooltipInfo } from './icon-tooltip-info'

export function IconTooltipCard({ x, y, object }: PickingInfo<Point>) {
  return (
    <>
      {object && (
        <Card
          style={{ left: x, top: y, zIndex: 1 }}
          className="pointer-events-none absolute min-w-40 max-w-96 px-3 py-2"
        >
          <IconTooltipInfo
            label="Data"
            value={format(new Date(object?.startTime), "dd/MM/yyyy 'às' HH:mm")}
          />
          <IconTooltipInfo label="Bairro" value={object.district} />
          <IconTooltipInfo label="Localidade" value={object.location} />
          <IconTooltipInfo label="Sentido" value={object.direction} />
        </Card>
      )}
    </>
  )
}
