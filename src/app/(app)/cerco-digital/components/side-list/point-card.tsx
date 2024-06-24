import { format } from 'date-fns'

import { Card, CardDescription } from '@/components/ui/card'
import { useCarPath } from '@/hooks/useCarPathContext'
import type { Point } from '@/utils/formatCarPathResponse'

interface PointCardProps extends Point {
  index: number
}

export function PointCard({
  index,
  location,
  direction,
  lane,
  startTime,
  from,
}: PointCardProps) {
  const { setViewport, viewport } = useCarPath()
  return (
    <Card
      className="hover:scale-102 flex min-w-80 gap-6 p-4 hover:cursor-pointer hover:bg-border"
      onClick={() => {
        setViewport({
          ...viewport,
          longitude: from[0],
          latitude: from[1],
        })
      }}
    >
      <div className="flex items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <span className="font-bold text-black">{index + 1}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <CardDescription className="text-xs">Localização:</CardDescription>
        <div className="flex flex-col gap-1">
          <span className="block">{location}</span>
          <span className="block text-sm text-muted-foreground">
            Sentido: {direction}
          </span>
          <span className="block text-xs text-muted-foreground">
            Faixa: {lane}
          </span>
          <CardDescription className="text-xs">
            Data: {format(new Date(startTime), "dd/MM/yyyy 'às' HH:mm")}
          </CardDescription>
        </div>
      </div>
    </Card>
  )
}
