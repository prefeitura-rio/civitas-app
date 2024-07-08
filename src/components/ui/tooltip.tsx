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
  text?: string
  side?: 'left' | 'right' | 'bottom' | 'top'
  disabled?: boolean
  className?: string
  asChild?: boolean
  hideContent?: boolean
  disabledText?: string
}

export function Tooltip({
  children,
  text,
  side,
  disabled = false,
  className = '',
  asChild = false,
  hideContent = false,
  disabledText,
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={0}>
      <RawTooltip>
        <TooltipTrigger asChild={asChild} disabled={disabled}>
          {children}
        </TooltipTrigger>
        {!hideContent && (
          <TooltipContent
            side={side}
            className={cn('max-w-sm text-justify', className)}
            sideOffset={10}
          >
            <p>{disabled && disabledText ? disabledText : text}</p>
          </TooltipContent>
        )}
      </RawTooltip>
    </TooltipProvider>
  )
}
