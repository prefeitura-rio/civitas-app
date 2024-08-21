import { formatDate } from 'date-fns'

import { TooltipInfoItem } from '@/app/(app)/mapa/components/common/tooltip-info-item'
import { Card } from '@/components/ui/card'
import { useMap } from '@/hooks/use-contexts/use-map-context'

export function FogoCruzadoHoverCard() {
  const {
    layers: {
      fogoCruzadoIncidents: {
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
          {object.date && (
            <TooltipInfoItem
              label="Data"
              value={formatDate(object.date, 'dd/MM/y HH:mm')}
            />
          )}
          {object.address && (
            <TooltipInfoItem label="Endereço" value={object.address} />
          )}
          {object.locality && (
            <TooltipInfoItem label="Localidade" value={object.locality.name} />
          )}
          <TooltipInfoItem
            label="Motivo principal"
            value={object.contextInfo.mainReason.name}
          />
          <TooltipInfoItem
            label="Motivos complementares"
            value={object.contextInfo.complementaryReasons
              .map((item) => item.name)
              .join(', ')}
          />
          <TooltipInfoItem
            label="Recortes relevantes"
            value={object.contextInfo.clippings
              .map((item) => item.name)
              .join(', ')}
          />
          <TooltipInfoItem
            label="Ação policial"
            value={object.policeAction ? 'Sim' : 'Não'}
          />
          <TooltipInfoItem
            label="Agentes presentes"
            value={object.agentPresence ? 'Sim' : 'Não'}
          />
          {object.contextInfo.policeUnit && (
            <TooltipInfoItem
              label="Unidade Policial"
              value={object.contextInfo.policeUnit}
            />
          )}
          <TooltipInfoItem
            label="Vítimas humanas"
            value={
              object.victims.length > 0
                ? 'Sim (Clique para ver detalhes)'
                : 'Não'
            }
          />
          <TooltipInfoItem
            label="Vítimas animais"
            value={
              object.animalVictims.length > 0
                ? 'Sim (Clique para ver detalhes)'
                : 'Não'
            }
          />
          <TooltipInfoItem
            label="Massacre"
            value={object.contextInfo.massacre ? 'Sim' : 'Não'}
          />
        </Card>
      )}
    </>
  )
}
