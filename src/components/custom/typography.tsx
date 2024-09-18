import { cn } from '@/lib/utils'

export const Label = ({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) => <span className={cn('text-sm font-semibold', className)}>{children}</span>

export const Value = ({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) => (
  <span
    className={cn('text-sm font-semibold text-muted-foreground', className)}
  >
    {children}
  </span>
)
