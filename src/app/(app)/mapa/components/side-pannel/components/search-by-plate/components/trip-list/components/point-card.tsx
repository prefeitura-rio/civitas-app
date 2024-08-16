import { formatDate } from 'date-fns'
import { TriangleAlert } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip'
import { useMap } from '@/hooks/use-contexts/use-map-context'
import type { Point } from '@/models/entities'
import { haversineDistance } from '@/utils/haversine-distance'

interface PointCardProps {
  point: Point
}

export function PointCard({ point }: PointCardProps) {
  const {
    setViewport,
    layers: {
      trips: { selectedTrip },
    },
  } = useMap()

  const points = selectedTrip?.points || []

  const distanceInKilometers = point.to
    ? haversineDistance({
        pointA: point.from,
        pointB: point.to,
      }) / 1000
    : 0

  const intervalInHours = point.endTime
    ? Math.abs(
        new Date(point.startTime).getTime() - new Date(point.endTime).getTime(),
      ) /
      1000 /
      60 /
      60
    : 0

  const speed = distanceInKilometers / intervalInHours

  function handlePointClick() {
    const longitude = point.from[0]
    const latitude = point.from[1]
    setViewport({
      zoom: 13.5,
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
      {point.cloneAlert && (
        <div className="absolute -left-10">
          <Tooltip
            className="p-0"
            render={
              <Card className="m-0">
                <CardHeader>
                  <CardTitle>Alerta de suspeita de placa clonada:</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-decoration">
                    <li>
                      <span className="text-muted-foreground">Origem: </span>
                      <span>{point.district.capitalizeFirstLetter()}</span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">Destino: </span>
                      <span>
                        {points
                          .at(point.index + 1)
                          ?.district.capitalizeFirstLetter()}
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">Intervalo: </span>
                      <span>
                        {((point.secondsToNextPoint || 0) / 60).toFixed(0)} min
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">
                        Velocidade Média:{' '}
                      </span>
                      <span className="text-destructive">
                        {speed.toFixed(0)} Km/h
                      </span>
                    </li>
                  </ul>

                  <p className="">
                    Obs.: A velocidade média informada acima é calculada para
                    uma linha reta entre dois pontos na superfície da terra, não
                    considerando possíveis trajetos realizados pelo veículo.
                  </p>
                </CardContent>
              </Card>
            }
          >
            <TriangleAlert className="h-4 w-4 text-destructive" />
          </Tooltip>
        </div>
      )}
      <span className="w-10 shrink-0">
        {formatDate(point.startTime, 'HH:mm')}
      </span>
      {point.index < points.length - 1 && (
        <div className="absolute left-[3.35rem] top-0 mt-2 h-full w-0.5 bg-primary" />
      )}
      <div className="z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-card" />
      <div className="ml-1.5 flex flex-col truncate">
        <Tooltip text={point.location.capitalizeFirstLetter()}>
          <div className="truncate">
            <span className="truncate">
              {point.location.capitalizeFirstLetter()}
            </span>
          </div>
        </Tooltip>
        <span className="block truncate text-xs text-muted-foreground">
          {point.district.capitalizeFirstLetter()}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {`${point.speed} Km/h`}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {`Sentido ${point.direction.capitalizeFirstLetter()}`}
        </span>
      </div>
    </div>
  )
}
