'use client'

/* eslint-disable @next/next/no-img-element */
import { type PickingInfo } from 'deck.gl'
import type { Feature } from 'geojson'
import { Building, MapPin, Phone, User } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface HoverCardProps {
  hoveredObject: PickingInfo<Feature> | null
  setIsHoveringInfoCard: (isHovering: boolean) => void
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1">
      <Icon className="size-3.5 shrink-0" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
    <span className="text-xs">{value}</span>
  </div>
)

const TOOLTIP_HORIZONTAL_MARGIN = 50 // Margin from the cursor
const TOOLTIP_VERTICAL_MARGIN = 10 // Margin from the cursor
const TOOLTIP_WIDTH = 300 // Assuming a fixed width for the tooltip
const TOOLTIP_HEIGHT = 284 // Approximate height of the tooltip, adjust as needed

export function AISPHoverCard({
  hoveredObject,
  setIsHoveringInfoCard,
}: HoverCardProps) {
  if (!hoveredObject?.object) return null
  const object = hoveredObject.object?.properties

  const x = hoveredObject.x
  const y = hoveredObject.y
  const viewportWidth = hoveredObject.viewport!.width
  const viewportHeight = hoveredObject.viewport!.height

  let left: number | undefined
  let top: number | undefined

  // Determine horizontal position
  if (x < viewportWidth / 2) {
    // Cursor is on the left half of the screen
    left = x + TOOLTIP_HORIZONTAL_MARGIN
  } else {
    // Cursor is on the right half of the screen
    left = x - TOOLTIP_WIDTH - TOOLTIP_HORIZONTAL_MARGIN
  }

  // Determine vertical position
  if (y < viewportHeight / 2) {
    // Cursor is on the top half of the screen
    top = y + TOOLTIP_VERTICAL_MARGIN
  } else {
    // Cursor is on the bottom half of the screen
    top = y - TOOLTIP_HEIGHT - TOOLTIP_VERTICAL_MARGIN
  }

  // Adjust for edge cases
  if (left < 0) left = TOOLTIP_HORIZONTAL_MARGIN
  if (left + TOOLTIP_WIDTH > viewportWidth)
    left = viewportWidth - TOOLTIP_WIDTH - TOOLTIP_HORIZONTAL_MARGIN
  if (top < 0) top = TOOLTIP_VERTICAL_MARGIN
  if (top + TOOLTIP_HEIGHT > viewportHeight)
    top = viewportHeight - TOOLTIP_HEIGHT - TOOLTIP_VERTICAL_MARGIN

  return (
    <Card
      onMouseEnter={() => {
        setIsHoveringInfoCard(true)
      }}
      onMouseOut={() => {
        setIsHoveringInfoCard(false)
      }}
      style={{ left, top }}
      className={cn(
        'absolute w-[300px] px-3 py-2',
        hoveredObject && hoveredObject.object ? '' : 'hidden',
      )}
    >
      <h4>Área Integrada de Segurança Pública (AISP)</h4>
      <Separator className="mb-4 mt-1 bg-secondary" />
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="ap-4 grid grid-cols-2">
            <InfoItem icon={Building} label="Unidade" value={object?.unidade} />
            <InfoItem icon={MapPin} label="Código AISP" value={object?.aisp} />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold">Contato</h4>
          <Separator className="bg-secondary" />
          <div className="grid gap-4">
            <InfoItem
              icon={User}
              label="Responsável"
              value={object?.responsavel}
            />
            <InfoItem
              icon={Phone}
              label="Telefone do responsável"
              value={object?.telefone_responsavel}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
