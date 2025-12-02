import { memo } from 'react'

import type { Radar } from '@/models/entities'

import { RadarItem } from './radar-item'

type SelectedRadarsListProps = {
  selectedRadars: Radar[]
  onFocus: (radar: Radar) => void
  onRemove: (radar: Radar) => void
}

export const SelectedRadarsList = memo(function SelectedRadarsList({
  selectedRadars,
  onFocus,
  onRemove,
}: SelectedRadarsListProps) {
  return (
    <div className="space-y-2">
      {selectedRadars.map((radar) => (
        <RadarItem
          key={radar.cetRioCode}
          radar={radar}
          onFocus={onFocus}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
})
