import type { PickingInfo } from '@deck.gl/core'

import { Card } from '@/components/ui/card'
import type { Radar } from '@/models/entities'

import { TooltipInfoItem } from './tooltip-info-item'

export function RadarTooltipCard({ object, x, y }: PickingInfo<Radar>) {
  return (
    <>
      {object && (
        <Card
          style={{ left: x, top: y, zIndex: 1 }}
          className="pointer-events-none absolute min-w-40 max-w-96 px-3 py-2"
        >
          <TooltipInfoItem label="Código CET-Rio" value={object.codcet} />
          <TooltipInfoItem label="Número Câmera" value={object.cameraNumero} />
          <TooltipInfoItem label="locequip" value={object.locequip} />
          <TooltipInfoItem label="Bairro" value={object.bairro} />
          <TooltipInfoItem label="Logradouro" value={object.logradouro} />
          <TooltipInfoItem label="Sentido" value={object.sentido} />
        </Card>
      )}
    </>
  )
}
