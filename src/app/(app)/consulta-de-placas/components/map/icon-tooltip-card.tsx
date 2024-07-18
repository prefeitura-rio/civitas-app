import type { PickingInfo } from '@deck.gl/core'
import { format } from 'date-fns'

import { Card } from '@/components/ui/card'
import type { Point } from '@/utils/formatCarPathResponse'

import { TooltipInfoItem } from './tooltip-info-item'

export function IconTooltipCard({ x, y, object }: PickingInfo<Point>) {
  return (
    <>
      {object && (
        <Card
          style={{ left: x, top: y, zIndex: 1 }}
          className="pointer-events-none absolute min-w-40 max-w-96 px-3 py-2"
        >
          <TooltipInfoItem
            label="Data"
            value={format(new Date(object?.startTime), "dd/MM/yyyy 'às' HH:mm")}
          />
          <TooltipInfoItem label="Bairro" value={object.district} />
          <TooltipInfoItem label="Localidade" value={object.location} />
          <TooltipInfoItem label="Sentido" value={object.direction} />
          {object.secondsToNextPoint && (
            <TooltipInfoItem
              label="Intervalo até o próximo ponto"
              value={
                String((object.secondsToNextPoint / 60).toFixed(0)) + ' min'
              }
            />
          )}
        </Card>
      )}
    </>
  )
}
