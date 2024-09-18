import { formatDate } from 'date-fns'
import type { PickingInfo } from 'deck.gl'
import type { Dispatch, SetStateAction } from 'react'

import { MapHoverCard } from '@/components/custom/map-hover-card'
import type { WazeAlert } from '@/models/entities'

import { TooltipInfoItem } from '../tooltip-info-item'

interface WazePoliceAlertHoverCardProps {
  hoveredObject: PickingInfo<WazeAlert> | null
  setIsHoveringInfoCard: Dispatch<SetStateAction<boolean>>
}

export function WazePoliceAlertHoverCard({
  hoveredObject,
  setIsHoveringInfoCard,
}: WazePoliceAlertHoverCardProps) {
  const object = hoveredObject?.object

  return (
    <MapHoverCard hoveredObject={hoveredObject}>
      {object && (
        <div
          onMouseEnter={() => {
            setIsHoveringInfoCard(true)
          }}
          onMouseOut={() => {
            setIsHoveringInfoCard(false)
          }}
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
        </div>
      )}
    </MapHoverCard>
  )
}
