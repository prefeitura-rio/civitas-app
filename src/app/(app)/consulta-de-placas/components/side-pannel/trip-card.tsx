import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

import { useCarPath } from '@/hooks/useCarPathContext'
import type { Point } from '@/utils/formatCarPathResponse'
import { toPascalCase } from '@/utils/toPascalCase'

import { PointCard } from './point-card'

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
  const {
    setSelectedTripIndex,
    setViewport,
    viewport,
    trips,
    selectedTripIndex,
  } = useCarPath()

  const points = trips?.at(index)?.points || []
  const isSelected = selectedTripIndex === index

  function handleTripClick() {
    setSelectedTripIndex(index)
    const longitude = points?.at(0)?.from[0]
    const latitude = points?.at(0)?.from[1]
    setViewport({
      ...viewport,
      longitude: longitude || viewport.longitude,
      latitude: latitude || viewport.latitude,
    })
  }

  function handlePointClick(pointIndex: number) {
    const longitude = points?.at(pointIndex)?.from[0]
    const latitude = points?.at(pointIndex)?.from[1]
    setViewport({
      ...viewport,
      longitude: longitude || viewport.longitude,
      latitude: latitude || viewport.latitude,
    })
  }

  const startTime = new Date(startLocation.startTime)
  const endTime = new Date(endLocation.startTime)
  const dayInterval = endTime.getDate() - startTime.getDate()
  const timeInterval = getTimeDiff(startTime, endTime)
  const totalIndexes = endLocation.index - startLocation.index

  return (
    <div
      className={twMerge(
        'space-y-4 border-l-4 border-l-transparent p-4 tracking-tighter hover:cursor-pointer hover:bg-border',
        isSelected ? 'border-l-4 border-l-primary' : '',
      )}
      onClick={(e) => {
        e.stopPropagation()
        handleTripClick()
      }}
    >
      {/* First row: Date and Time */}
      <div className={'flex font-bold'}>
        <div className="inline-flex">
          <div className="w-20">
            <span className="">{format(startTime, 'dd/MMM')}</span>
          </div>
          <div className="">
            <span className="relative whitespace-nowrap text-justify">{`${format(startTime, 'hh:mm aa')} - ${format(endTime, 'hh:mm aa')}`}</span>
            {dayInterval > 0 && (
              <span className="absolute -right-5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-sm bg-card-foreground text-xs text-card">
                +{dayInterval}
              </span>
            )}
          </div>
        </div>
        <div className="flex w-full justify-end">
          <span className="whitespace-nowrap text-end">{timeInterval}</span>
        </div>
      </div>

      {/* Second row: Districts */}
      <div className="flex w-full items-center gap-2 pl-20 text-muted-foreground">
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

      {/* Point List */}
      {isSelected && (
        <div className="flex flex-col pl-20 text-sm">
          {points.length > 0 ? (
            points.map((point, index) => (
              <PointCard
                key={index}
                index={index}
                location={point.location}
                startTime={point.startTime}
                from={point.from}
                direction={point.direction}
                district={point.district}
              />
            ))
          ) : (
            <span>Nenhum resultado encontrado</span>
          )}
        </div>
      )}
    </div>
  )
}
