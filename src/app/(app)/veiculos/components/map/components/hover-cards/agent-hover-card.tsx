import { formatDate } from 'date-fns'
import type { PickingInfo } from 'deck.gl'
import type { Dispatch, SetStateAction } from 'react'

import { MapHoverCard } from '@/components/custom/map-hover-card'
import type { Agent } from '@/models/entities'

import { TooltipInfoItem } from '../tooltip-info-item'

interface AgentHoverCardProps {
  hoveredObject: PickingInfo<Agent> | null
  setIsHoveringInfoCard: Dispatch<SetStateAction<boolean>>
}
export function AgentHoverCard({
  hoveredObject,
  setIsHoveringInfoCard,
}: AgentHoverCardProps) {
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
        </div>
      )}
    </MapHoverCard>
  )
}
