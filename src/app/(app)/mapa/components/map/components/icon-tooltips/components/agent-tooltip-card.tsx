import { formatDate } from 'date-fns'

import { TooltipInfoItem } from '@/app/(app)/mapa/components/common/tooltip-info-item'
import { Card } from '@/components/ui/card'
import { useMap } from '@/hooks/use-contexts/use-map-context'

export function AgentTooltipCard() {
  const {
    layers: {
      agents: {
        layerStates: {
          hoverInfo: { object, x, y },
        },
      },
    },
  } = useMap()

  return (
    <>
      {object && (x !== 0 || y !== 0) && (
        <Card
          style={{ left: x, top: y, zIndex: 1 }}
          className="pointer-events-none absolute min-w-40 max-w-96 px-3 py-2"
        >
          <TooltipInfoItem label="Nome" value={object.name} />
          <TooltipInfoItem label="Operação" value={object.operation} />
          <TooltipInfoItem
            label="Info. de contato"
            value={object.contactInfo}
          />
          <TooltipInfoItem
            label="Última atualização"
            value={formatDate(object.lastUpdate, "dd/MM/yyyy 'às' HH:mm:ss")}
          />
        </Card>
      )}
    </>
  )
}
