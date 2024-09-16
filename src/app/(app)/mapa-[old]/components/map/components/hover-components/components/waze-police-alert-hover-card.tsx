import { formatDate } from 'date-fns'

import { TooltipInfoItem } from '@/app/(app)/mapa/components/common/tooltip-info-item'
import { MapHoverCard } from '@/components/custom/map-hover-card'
import { useMap } from '@/hooks/use-contexts/use-map-context'

export function WazePoliceAlertHoverCard() {
  const {
    layers: {
      wazePoliceAlerts: {
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
          <TooltipInfoItem label="Logradouro" value={object.street || ''} />
          <TooltipInfoItem
            label="Data"
            value={formatDate(object.timestamp, "dd/MM/yyyy 'às' HH:mm")}
          />
          {object.subtype && (
            <TooltipInfoItem
              label="Tipo"
              value={
                object.subtype === 'POLICE_HIDING'
                  ? 'Polícia oculta'
                  : object.subtype
              }
            />
          )}
          <TooltipInfoItem
            label="Confiabilidade"
            value={object.reliability.toString()}
          />
          <TooltipInfoItem
            label="Confiança"
            value={object.confidence.toString()}
          />
          <TooltipInfoItem
            label="Número de joinhas"
            value={object.numberThumbsUp?.toString() || '0'}
          />
        </>
      )}
    </MapHoverCard>
  )
}
