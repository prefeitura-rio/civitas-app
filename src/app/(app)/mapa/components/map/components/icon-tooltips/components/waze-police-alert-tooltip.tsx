import { formatDate } from 'date-fns'

import { TooltipInfoItem } from '@/app/(app)/mapa/components/common/tooltip-info-item'
import { Card } from '@/components/ui/card'
import { useMap } from '@/hooks/use-contexts/use-map-context'

export function WazePoliceAlertTooltip() {
  const {
    layers: {
      wazePoliceAlerts: {
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
          style={{
            left: x,
            top: y,
            zIndex: 1,
          }}
          className="pointer-events-none absolute min-w-40 max-w-96 px-3 py-2"
        >
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
        </Card>
      )}
    </>
  )
}
