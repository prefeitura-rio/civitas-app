import { NavigationIcon, XCircleIcon } from 'lucide-react'
import { memo } from 'react'

import { Button } from '@/components/ui/button'
import type { Radar } from '@/models/entities'

interface RadarItemProps {
  radar: Radar
  onFocus: (radar: Radar) => void
  onRemove: (radar: Radar) => void
}

export const RadarItem = memo(function RadarItem({
  radar,
  onFocus,
  onRemove,
}: RadarItemProps) {
  return (
    <div className="flex items-center justify-between rounded bg-secondary p-2">
      <div>
        <div className="font-medium">{radar.cetRioCode}</div>
        <div className="text-sm text-muted-foreground">{radar.location}</div>
      </div>
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" onClick={() => onFocus(radar)}>
          <NavigationIcon className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onRemove(radar)}>
          <XCircleIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
})
