import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

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
  const {
    setSelectedTripIndex,
    setViewport,
    viewport,
    trips,
    selectedTripIndex,
  } = useCarPath()
  // const [shouldExpand, setShouldExpand] = useState(true)

  const points = trips?.at(index)?.points || []
  const isSelected = selectedTripIndex === index

  // if (!isSelected && shouldExpand) {
  // setShouldExpand(false)
  // }

  function handleTripClick() {
    // setShouldExpand(!shouldExpand)
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
    console.log(pointIndex)
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
  // const dayInterval = 1
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

      {/* Third row: Details */}
      {/* <div className="pl-20">
        <Button
          className="h-4 p-0"
          variant="link"
          onClick={(e) => {
            e.stopPropagation()
            setOpenDetails(!openDetails)
          }}
        >
          Trajeto
        </Button>
      </div> */}

      {/* {shouldExpand && ( */}
      {isSelected && (
        <div className="flex flex-col pl-20 text-sm">
          {points.length > 0 ? (
            points.map((point, index) => (
              <div
                className="relative flex gap-2 rounded-md hover:bg-card"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePointClick(index)
                }}
              >
                <span className="w-16 shrink-0">
                  {format(new Date(point.startTime), 'hh:mm aa')}
                </span>
                {index < points.length - 1 && (
                  <div className="absolute left-[4.8rem] top-0 mt-2 h-full w-0.5 bg-primary" />
                )}
                <div className="z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-card" />
                <div className="ml-1.5 flex w-full flex-col truncate">
                  <Tooltip text={toPascalCase(point.location)}>
                    <div className="truncate">
                      <span className="truncate">
                        {toPascalCase(point.location)}
                      </span>
                    </div>
                  </Tooltip>
                  <span className="block truncate text-xs text-muted-foreground">
                    {toPascalCase(point.district)}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
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
