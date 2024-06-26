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
}

export function Tooltip({ children, text }: TooltipProps) {
  return (
    <TooltipProvider>
      <RawTooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </RawTooltip>
    </TooltipProvider>
  )
}
