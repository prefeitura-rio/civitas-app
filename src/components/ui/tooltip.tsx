import type { ReactNode } from 'react'

import {
  Tooltip as RawTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/raw-tooltip'

interface TooltipProps {
  children: ReactNode
  text: string
  side?: 'left' | 'right' | 'bottom' | 'top'
}

export function Tooltip({ children, text, side }: TooltipProps) {
  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={100}>
      <RawTooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent side={side}>
          <p>{text}</p>
        </TooltipContent>
      </RawTooltip>
    </TooltipProvider>
  )
}
