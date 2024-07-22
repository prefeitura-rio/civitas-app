import { formatDate } from 'date-fns'

import { Card } from '@/components/ui/card'
import { useMapLayers } from '@/hooks/use-contexts/use-map-layers-context'

import { TooltipInfoItem } from './tooltip-info-item'

export function WazePoliceAlertTooltip() {
  const {
    mapStates: { wazePoliceAlertHoverInfo },
  } = useMapLayers()

  return (
    <>
      {wazePoliceAlertHoverInfo &&
        wazePoliceAlertHoverInfo.object &&
        (wazePoliceAlertHoverInfo.x !== 0 ||
          wazePoliceAlertHoverInfo.y !== 0) && (
          <Card
            style={{
              left: wazePoliceAlertHoverInfo.x,
              top: wazePoliceAlertHoverInfo.y,
              zIndex: 1,
            }}
            className="pointer-events-none absolute min-w-40 max-w-96 px-3 py-2"
          >
            <TooltipInfoItem
              label="Logradouro"
              value={wazePoliceAlertHoverInfo.object.street || ''}
            />
            <TooltipInfoItem
              label="Data"
              value={formatDate(
                wazePoliceAlertHoverInfo.object.timestamp,
                "dd/MM/yyyy 'às' HH:mm",
              )}
            />
            {wazePoliceAlertHoverInfo.object.subtype && (
              <TooltipInfoItem
                label="Tipo"
                value={
                  wazePoliceAlertHoverInfo.object.subtype === 'POLICE_HIDING'
                    ? 'Polícia oculta'
                    : wazePoliceAlertHoverInfo.object.subtype
                }
              />
            )}
            <TooltipInfoItem
              label="Confiabilidade"
              value={wazePoliceAlertHoverInfo.object.reliability.toString()}
            />
            <TooltipInfoItem
              label="Confiança"
              value={wazePoliceAlertHoverInfo.object.confidence.toString()}
            />
            <TooltipInfoItem
              label="Número de joinhas"
              value={
                wazePoliceAlertHoverInfo.object.numberThumbsUp?.toString() ||
                '0'
              }
            />
          </Card>
        )}
    </>
  )
}
