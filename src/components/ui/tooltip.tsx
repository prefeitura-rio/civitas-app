import type { ReactNode } from 'react'

import {
  Tooltip as RawTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/raw-tooltip'
import { cn } from '@/lib/utils'

interface TooltipProps {
  children: ReactNode
  text: string
  side?: 'left' | 'right' | 'bottom' | 'top'
  disabled?: boolean
  className?: string
  asChild?: boolean
}

export function Tooltip({
  children,
  text,
  side,
  disabled = false,
  className = '',
  asChild = false,
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={0}>
      <RawTooltip>
        <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
        {!disabled && (
          <TooltipContent
            side={side}
            className={cn('max-w-sm text-justify', className)}
            sideOffset={10}
          >
            <p>{text}</p>
          </TooltipContent>
        )}
      </RawTooltip>
    </TooltipProvider>
  )
}
