import { format } from 'date-fns'

import { Tooltip } from '@/components/ui/tooltip'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import type { Point } from '@/models/entities'
import { toPascalCase } from '@/utils/toPascalCase'

interface PointCardProps
  extends Pick<
    Point,
    'index' | 'location' | 'direction' | 'district' | 'startTime' | 'from'
  > {}

export function PointCard({
  index,
  location,
  direction,
  district,
  startTime,
  from,
}: PointCardProps) {
  const {
    setViewport,
    layers: {
      trips: { selectedTrip },
    },
  } = useMap()

  const points = selectedTrip?.points || []

  function handlePointClick() {
    const longitude = from[0]
    const latitude = from[1]
    setViewport({
      longitude,
      latitude,
    })
  }

  return (
    <div
      className="relative flex gap-2 rounded-md hover:bg-card"
      onClick={(e) => {
        e.stopPropagation()
        handlePointClick()
      }}
    >
      <span className="w-16 shrink-0">
        {format(new Date(startTime), 'hh:mm aa')}
      </span>
      {index < points.length - 1 && (
        <div className="absolute left-[4.8rem] top-0 mt-2 h-full w-0.5 bg-primary" />
      )}
      <div className="z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-card" />
      <div className="ml-1.5 flex flex-col truncate">
        <Tooltip text={toPascalCase(location)}>
          <div className="truncate">
            <span className="truncate">{toPascalCase(location)}</span>
          </div>
        </Tooltip>
        <span className="block truncate text-xs text-muted-foreground">
          {toPascalCase(district)}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {toPascalCase('Sentido ' + direction)}
        </span>
      </div>
    </div>
  )
}
