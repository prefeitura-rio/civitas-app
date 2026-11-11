import type { ComponentProps } from 'react'

import { Card } from '@/modules/vehicle-intelligence/components/ui/card'
import { cn } from '@/modules/vehicle-intelligence/lib/utils'

type PanelProps = ComponentProps<'section'>

export function Panel({ className, ...props }: PanelProps) {
  return (
    <Card asChild>
      <section
        className={cn(
          'min-w-0 gap-0 overflow-hidden border-border bg-card py-0 shadow-none',
          className,
        )}
        {...props}
      />
    </Card>
  )
}
