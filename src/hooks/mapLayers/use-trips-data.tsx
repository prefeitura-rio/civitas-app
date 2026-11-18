import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import {
  getCarHint,
  type GetCarHintRequest,
} from '@/http/cars/hint/get-cars-hint'
import {
  getCarPath,
  type GetCarPathRequest,
} from '@/http/cars/path/get-car-path'
import type { Trip } from '@/models/entities'
import type { SetViewportProps } from '@/models/utils'

export interface UseTripsProps {
  setViewport: (props: SetViewportProps) => void
}

export interface UseTripsData {
  getTrips: (props: GetCarPathRequest) => Promise<Trip[]>
  getPossiblePlates: (props: GetCarHintRequest) => Promise<string[]>
  clearSearch: () => void
  isLoading: boolean
  trips: Trip[] | undefined
  lastSearchParams: GetCarPathRequest | null
  selectedTrip: Trip | null
  selectedTrips: Trip[]
  setSelectedTrip: (trip: number | Trip | null) => void
  possiblePlates: string[] | undefined
}

export function useTripsData({ setViewport }: UseTripsProps): UseTripsData {
  const [selectedTrips, setSelectedTrips] = useState<Trip[]>([])
  const selectedTrip = selectedTrips.at(-1) ?? null
  const [lastSearchParams, setLastSearchParams] =
    useState<GetCarPathRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function clearSearch() {
    clearPossiblePlates()
    clearTrips()
    setSelectedTrips([])
    setLastSearchParams(null)
  }

  /** Keep at most two open trips, closing the oldest when another is opened. */
  function setSelectedTrip(trip: number | Trip | null) {
    if (trip === null) {
      setSelectedTrips([])
      return
    }

    const target =
      typeof trip === 'number'
        ? Number.isInteger(trip) && trip >= 0
          ? trips?.[trip]
          : undefined
        : trip
    if (!target) {
      setSelectedTrips([])
      return
    }

    setSelectedTrips((current) => {
      if (
        typeof trip === 'number' &&
        current.some((item) => item.index === target.index)
      ) {
        return current.filter((item) => item.index !== target.index)
      }
      return [
        ...current.filter((item) => item.index !== target.index),
        target,
      ].slice(-2)
    })
  }

  const {
    data: trips,
    isPending: getTripsIsPending,
    mutateAsync: getTrips,
    reset: clearTrips,
  } = useMutation({
    mutationFn: getCarPath,
    onMutate(variables) {
      clearPossiblePlates()
      setSelectedTrips([])
      setLastSearchParams({
        plate: variables.plate,
        startTime: variables.startTime,
        endTime: variables.endTime,
      })
    },
    onSuccess(data) {
      if (data.length > 0) {
        setViewport({
          longitude: data.at(0)?.points.at(0)?.from[0],
          latitude: data.at(0)?.points.at(0)?.from[1],
        })
      }
    },
    onSettled(data) {
      setSelectedTrips(data?.length ? [data[0]] : [])
    },
  })

  const {
    data: possiblePlates,
    isPending: getPossiblePlatesIsPending,
    mutateAsync: getPossiblePlates,
    reset: clearPossiblePlates,
  } = useMutation({
    mutationFn: getCarHint,
    onMutate(variables) {
      setSelectedTrips([])
      setLastSearchParams({
        plate: variables.plate,
        startTime: variables.startTime,
        endTime: variables.endTime,
      })
    },
  })

  useEffect(() => {
    setIsLoading(getTripsIsPending || getPossiblePlatesIsPending)
  }, [getTripsIsPending, getPossiblePlatesIsPending])

  return {
    trips,
    isLoading,
    possiblePlates,
    getTrips,
    getPossiblePlates,
    clearSearch,
    lastSearchParams,
    selectedTrip,
    selectedTrips,
    setSelectedTrip,
  }
}
