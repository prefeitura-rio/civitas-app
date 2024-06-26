import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { useCarPath } from '@/hooks/useCarPathContext'
import type { Point } from '@/utils/formatCarPathResponse'
import { toPascalCase } from '@/utils/toPascalCase'

interface TripCardProps {
  index: number
  startLocation: Point
  endLocation: Point
}

function getTimeDiff(a: Date, b: Date) {
  const diff = Math.abs(a.getTime() - b.getTime())

  const totalMinutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)

  if (hours > 0) {
    return `${hours} hr ${minutes} min`
  }

  return `${minutes} min`
}

export function TripCard({ index, startLocation, endLocation }: TripCardProps) {
  const { setSelectedTripIndex, setViewport, viewport, trips } = useCarPath()
  const [openDetails, setOpenDetails] = useState(false)
  const [expandTripCard, setExpandTripCard] = useState(false)

  const points = trips?.at(index)?.points || []

  function handleCardClick() {
    setExpandTripCard(!expandTripCard)
    setSelectedTripIndex(index)
    const longitude = points?.at(0)?.from[0]
    const latitude = points?.at(0)?.from[1]
    setViewport({
      ...viewport,
      longitude: longitude || viewport.longitude,
      latitude: latitude || viewport.latitude,
    })
  }

  const startTime = new Date(startLocation.startTime)
  const endTime = new Date(endLocation.startTime)
  const dayInterval = endTime.getDate() - startTime.getDate()
  // const dayInterval = 1
  const timeInterval = getTimeDiff(startTime, endTime)
  const totalIndexes = endLocation.index - startLocation.index

  return (
    <div
      className="space-y-4 bg-card p-4 hover:cursor-pointer"
      onClick={handleCardClick}
    >
      {/* First row: Date and Time */}
      <div className="flex w-full items-center justify-between whitespace-nowrap">
        <div className="flex gap-8">
          <Tooltip text={format(startTime, 'dd/MM/yyyy')}>
            <span className="w-20">{format(startTime, 'dd/MMM')}</span>
          </Tooltip>

          <div className="flex justify-center gap-2">
            <span>{format(startTime, 'HH:mm')}</span>
            <span className="text-muted-foreground">{' - '}</span>
            <div className="relative">
              <span>{format(endTime, 'HH:mm')}</span>
              {dayInterval > 0 && (
                <span className="absolute -right-5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-sm bg-card-foreground text-xs text-card">
                  +{dayInterval}
                </span>
              )}
            </div>
          </div>
        </div>

        <span className="block w-24 text-end">{timeInterval}</span>
      </div>

      {/* Second row: Districts */}
      <div className="flex w-full items-center justify-center gap-2">
        <span>{toPascalCase(startLocation.district)}</span>
        {totalIndexes > 0 && (
          <>
            <div className="flex gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              {totalIndexes > 1 && (
                <>
                  <span className="text-xs">+{totalIndexes - 1}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </div>
            <span>{toPascalCase(endLocation.district)}</span>
          </>
        )}
      </div>

      {/* Third row: Details */}
      {expandTripCard && (
        <Button
          variant="link"
          onClick={(e) => {
            e.stopPropagation()
            setOpenDetails(!openDetails)
          }}
        >
          Ver detalhes
        </Button>
      )}

      {openDetails && (
        <div className="flex flex-col">
          {points.length > 0 ? (
            points.map((point, index) => (
              <div className="relative flex gap-2">
                <span className="w-12 shrink-0">
                  {format(new Date(point.startTime), 'HH:mm')}
                </span>
                {index < points.length - 1 && (
                  <div className="absolute left-[3.8rem] top-0 mt-2 h-full w-0.5 bg-primary" />
                )}
                <div className="z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-card" />
                <div className="ml-1.5 flex w-full flex-col truncate">
                  <span className="truncate">
                    {toPascalCase(point.location)}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {toPascalCase(point.district)}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {toPascalCase('Sentido ' + point.direction)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <span>Nenhum resultado encontrado</span>
          )}
        </div>
      )}
    </div>
  )
}
