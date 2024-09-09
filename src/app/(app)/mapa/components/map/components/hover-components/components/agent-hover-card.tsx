import { formatDate } from 'date-fns'

import { TooltipInfoItem } from '@/app/(app)/mapa/components/common/tooltip-info-item'
import { MapHoverCard } from '@/components/custom/map-hover-card'
import { useMap } from '@/hooks/use-contexts/use-map-context'

export function AgentHoverCard() {
  const {
    layers: {
      agents: {
        layerStates: {
          hoverInfo: { object, x, y, viewport },
        },
      },
    },
  } = useMap()

  return (
    <MapHoverCard x={x} y={y} object={object} viewport={viewport}>
      {object && (
        <>
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
        </>
      )}
    </MapHoverCard>
  )
}
