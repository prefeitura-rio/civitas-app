import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/modules/vehicle-intelligence/lib/utils'

interface PanelHeaderProps extends ComponentProps<'header'> {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
  compact?: boolean
}

export function PanelHeader({
  eyebrow,
  title,
  description,
  action,
  compact = false,
  className,
  ...props
}: PanelHeaderProps) {
  return (
    <header
      className={cn(
        'flex min-h-[75px] flex-row items-center justify-between gap-5 border-b border-border px-4 py-3.5',
        compact && 'min-h-16',
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </span>
        <h2 className="mb-0.5 mt-1 text-sm font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="m-0 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </header>
  )
}
