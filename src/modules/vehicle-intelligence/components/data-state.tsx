import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/modules/vehicle-intelligence/lib/utils'

const dataStateVariants = cva('flex gap-3 rounded-xl border p-4 text-sm', {
  variants: {
    tone: {
      neutral: 'border-border bg-card text-primary',
      danger: 'border-destructive/30 bg-destructive/5 text-destructive',
      warning: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    },
    centered: {
      true: 'min-h-60 flex-col items-center justify-center text-center',
      false: 'items-start',
    },
  },
  defaultVariants: {
    tone: 'neutral',
    centered: false,
  },
})

interface DataStateProps
  extends ComponentProps<'div'>,
    VariantProps<typeof dataStateVariants> {
  icon?: ReactNode
  title?: string
  children: ReactNode
}

export function DataState({
  icon,
  title,
  children,
  tone,
  centered,
  className,
  role,
  ...props
}: DataStateProps) {
  return (
    <div
      className={cn(dataStateVariants({ tone, centered }), className)}
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
      {...props}
    >
      {icon && (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className={cn('min-w-0', centered && 'flex flex-col items-center')}>
        {title && <strong className="text-sm text-foreground">{title}</strong>}
        <div
          className={cn(
            'text-xs leading-5 text-muted-foreground',
            title && 'mt-1',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
