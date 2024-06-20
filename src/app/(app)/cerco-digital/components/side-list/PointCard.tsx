import { format } from 'date-fns'

import { Card, CardDescription } from '@/components/ui/card'
import type { Point } from '@/utils/formatCarPathResponse'

interface PointCardProps extends Point {
  index: number
}

export function PointCard({
  index,
  location,
  direction,
  lane,
  date,
}: PointCardProps) {
  return (
    <Card className="flex min-w-80 gap-6 p-4">
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
            Data: {format(new Date(date), "dd/MM/yyyy 'às' HH:mm")}
          </CardDescription>
        </div>
      </div>
    </Card>
  )
}
