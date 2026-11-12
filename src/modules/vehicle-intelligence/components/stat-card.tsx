import type { LucideIcon } from 'lucide-react'

import {
  Card,
  CardContent,
} from '@/modules/vehicle-intelligence/components/ui/card'
import { cn } from '@/modules/vehicle-intelligence/lib/utils'

interface StatCardProps {
  label: string
  value: string
  meta: string
  icon: LucideIcon
  className?: string
}

export function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card
      role="article"
      className={cn(
        'min-h-24 justify-center gap-0 overflow-hidden border-border bg-card py-0 shadow-none',
        className,
      )}
    >
      <CardContent className="grid w-full grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-3 p-4">
        <div className="grid size-9 place-items-center rounded-lg border border-border bg-secondary text-muted-foreground">
          <Icon aria-hidden="true" size={18} />
        </div>
        <div className="min-w-0">
          <span className="block text-[0.6875rem] font-semibold uppercase leading-4 tracking-[0.08em] text-muted-foreground">
            {label}
          </span>
          <strong className="mt-0.5 block whitespace-nowrap text-[1.35rem] font-semibold tabular-nums leading-tight tracking-[-0.035em] text-foreground">
            {value}
          </strong>
          <small className="mt-1 block text-[0.8125rem] leading-5 text-secondary-foreground/80">
            {meta}
          </small>
        </div>
      </CardContent>
    </Card>
  )
}
