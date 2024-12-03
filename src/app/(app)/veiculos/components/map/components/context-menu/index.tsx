'use client'

/* eslint-disable @next/next/no-img-element */
import { type PickingInfo } from 'deck.gl'
import { useState } from 'react'

import { Popover, PopoverContent } from '@/components/ui/popover'

import { AISPInfo } from './components/aisp-info'
import { calculateTooltipAbsolutePosition } from './components/calculate-tooltip-absolute-position'
import { CISPInfo } from './components/cisp-info'
import { FogoCruzadoInfo } from './components/fogo-cruzado-info'
import { RadarInfo } from './components/radar-info'
import { SchoolInfo } from './components/school-info'
import { WazePoliceAlertInfo } from './components/waze-police-alert-info'

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
  const [cardRef, setCardRef] = useState<HTMLDivElement | null>(null)
  if (!pickingInfo || !pickingInfo.object) return null

  const { top, left } = calculateTooltipAbsolutePosition(
    pickingInfo,
    cardRef?.clientWidth,
    cardRef?.clientHeight,
  )

  const Content = ({ pickingInfo }: { pickingInfo: PickingInfo }) => {
    if (pickingInfo?.layer?.id === 'radars') {
      return <RadarInfo pickingInfo={pickingInfo} />
    }

    if (pickingInfo?.layer?.id === 'AISP') {
      return <AISPInfo pickingInfo={pickingInfo} />
    }

    if (pickingInfo?.layer?.id === 'CISP') {
      return <CISPInfo pickingInfo={pickingInfo} />
    }

    if (pickingInfo?.layer?.id === 'waze-police-alert') {
      return <WazePoliceAlertInfo pickingInfo={pickingInfo} />
    }

    if (pickingInfo?.layer?.id === 'fogocruzado-incidents') {
      return <FogoCruzadoInfo pickingInfo={pickingInfo} />
    }

    if (pickingInfo?.layer?.id === 'schools') {
      return <SchoolInfo pickingInfo={pickingInfo} />
    }
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={false}>
      {pickingInfo.layer?.id &&
        [
          'radars',
          'AISP',
          'CISP',
          'waze-police-alert',
          'fogocruzado-incidents',
          'schools',
        ].includes(pickingInfo.layer.id) && (
          <PopoverContent
            ref={(ref) => setCardRef(ref)}
            style={{
              position: 'absolute',
              top,
              left,
              width: '400px',
            }}
          >
            <Content pickingInfo={pickingInfo} />
          </PopoverContent>
        )}
    </Popover>
  )
}
