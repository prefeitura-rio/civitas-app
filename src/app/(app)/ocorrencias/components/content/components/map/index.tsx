import { cn } from '@/lib/utils'

interface MapProps {
  className?: string
}

export function Map({ className }: MapProps) {
  return (
    <div className={cn(className, '')}>
      <h1>Map</h1>
    </div>
  )
}
