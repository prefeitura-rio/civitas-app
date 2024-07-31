import { cn } from '@/lib/utils'

interface TableProps {
  className?: string
}

export function Table({ className }: TableProps) {
  return (
    <div className={cn(className)}>
      <h1>Table</h1>
    </div>
  )
}
