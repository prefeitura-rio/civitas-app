import { format } from 'date-fns'

import { Card } from '@/components/ui/card'

import { IconTooltipInfo } from '../../consulta-de-placas/components/map/icon-tooltip-info'

export interface InfoPopupProps {
  x: number
  y: number
  object: {
    contactInfo: string
    lastUpdate: string
    name: string
    operation: string
  }
}

export function InfoPopup({ x, y, object }: InfoPopupProps) {
  return (
    <>
      {object && (
        <Card
          style={{
            left: x,
            top: y,
            zIndex: 1,
          }}
          className="pointer-events-none absolute min-w-40 max-w-96 px-3 py-2"
        >
          <IconTooltipInfo label="Nome" value={object.name} />
          <IconTooltipInfo label="Operçaão" value={object.operation} />
          <IconTooltipInfo label="Contato" value={object.contactInfo} />
          <IconTooltipInfo
            label="Última atualização"
            value={format(object.lastUpdate, "dd/MM/yyyy 'às' HH:mm")}
          />
        </Card>
      )}
    </>
  )
}
