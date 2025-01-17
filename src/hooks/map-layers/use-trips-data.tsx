import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

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
  setSelectedTrip: (trip: number | Trip | null) => void
  possiblePlates: string[] | undefined
}

export function useTripsData({ setViewport }: UseTripsProps): UseTripsData {
  const [selectedTrip, setSelectedTripState] = useState<Trip | null>(null)
  const [lastSearchParams, setLastSearchParams] =
    useState<GetCarPathRequest | null>(null)

  function clearSearch() {
    clearPossiblePlates()
    clearTrips()
    setSelectedTripState(null)
    setLastSearchParams(null)
  }

  function setSelectedTrip(trip: number | Trip | null) {
    if (typeof trip === 'number' && trips) {
      if (selectedTrip && trip === selectedTrip.index) {
        setSelectedTrip(null)
      } else {
        setSelectedTripState(trips[trip])
      }
    } else if (typeof trip === 'object' && trips) {
      setSelectedTripState(trip)
    } else {
      setSelectedTrip(null)
    }
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
      setSelectedTripState(data?.at(0) || null)
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
      setSelectedTripState(null)
      setLastSearchParams({
        plate: variables.plate,
        startTime: variables.startTime,
        endTime: variables.endTime,
      })
    },
  })

  return {
    trips,
    isLoading: getTripsIsPending || getPossiblePlatesIsPending,
    possiblePlates,
    getTrips,
    getPossiblePlates,
    clearSearch,
    lastSearchParams,
    selectedTrip,
    setSelectedTrip,
  }
}
