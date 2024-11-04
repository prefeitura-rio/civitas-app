'use client'

/* eslint-disable @next/next/no-img-element */
import { type PickingInfo } from 'deck.gl'
import { useState } from 'react'

import { Popover, PopoverContent } from '@/components/ui/popover'

import { calculateTooltipAbsolutePosition } from './components/calculate-tooltip-absolute-position'
import { RadarContextMenu } from './components/radar-info'

interface ContextMenuProps {
  pickingInfo: PickingInfo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContextMenu({
  pickingInfo,
  onOpenChange,
  open,
}: ContextMenuProps) {
  if (!pickingInfo) return null
  const [cardRef, setCardRef] = useState<HTMLDivElement | null>(null)

  const { top, left } = calculateTooltipAbsolutePosition(
    pickingInfo,
    cardRef?.clientWidth,
    cardRef?.clientHeight,
  )

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={false}>
      {pickingInfo?.layer?.id === 'radars' && (
        <PopoverContent
          ref={(ref) => setCardRef(ref)}
          style={{
            position: 'absolute',
            top,
            left,
            width: '400px',
          }}
        >
          <RadarContextMenu pickingInfo={pickingInfo} />
        </PopoverContent>
      )}
    </Popover>
  )
}
