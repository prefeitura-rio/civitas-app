import type { MapViewState } from '@deck.gl/core'
import { createContext, type ReactNode, useState } from 'react'

import {
  getCarPath as getCarPathApi,
  GetCarPathRequest,
} from '@/http/cars/path/get-car-path'
import { formatCarPathResponse, type Trip } from '@/utils/formatCarPathResponse'

interface CarPathContextProps {
  trips: Trip[] | undefined
  selectedTrip: Trip | undefined
  getCarPath: (props: GetCarPathRequest) => Promise<Trip[]>
  selectedTripIndex: number
  setSelectedTripIndex: (index: number) => void
  viewport: MapViewState
  setViewport: (viewport: MapViewState) => void
  isLoading: boolean
  lastSearchParams: GetCarPathRequest | undefined
}

export const CarPathContext = createContext({} as CarPathContextProps)

interface CarPathContextProviderProps {
  children: ReactNode
}

export function CarPathContextProvider({
  children,
}: CarPathContextProviderProps) {
  const [trips, setTrips] = useState<Trip[]>()
  const [selectedTripIndex, setSelectedTripIndexState] = useState(0)
  const [selectedTrip, setSelectedTrip] = useState<Trip>()
  const [viewport, setViewportState] = useState<MapViewState>({
    longitude: -43.47,
    latitude: -22.92957,
    zoom: 10.1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastSearchParams, setLastSearchParams] = useState<GetCarPathRequest>()

  function setSelectedTripIndex(index: number) {
    setSelectedTripIndexState(index)
    setSelectedTrip(trips?.at(index))
  }

  function setViewport(newViewport: MapViewState) {
    setViewportState(newViewport)
  }

  async function getCarPath({ placa, startTime, endTime }: GetCarPathRequest) {
    setIsLoading(true)
    setLastSearchParams({
      placa,
      startTime,
      endTime,
    })
    const response = await getCarPathApi({
      placa,
      startTime,
      endTime,
    })
    setIsLoading(false)

    const formattedTrips = formatCarPathResponse(response.data)
    setTrips(formattedTrips)
    setSelectedTripIndex(0)
    setViewport({
      ...viewport,
      longitude:
        formattedTrips.at(0)?.points.at(0)?.from[0] || viewport.longitude,
      latitude:
        formattedTrips.at(0)?.points.at(0)?.from[1] || viewport.latitude,
    })
    return formattedTrips
  }

  return (
    <CarPathContext.Provider
      value={{
        trips,
        selectedTrip,
        getCarPath,
        selectedTripIndex,
        setSelectedTripIndex,
        viewport,
        setViewport,
        isLoading,
        lastSearchParams,
      }}
    >
      {children}
    </CarPathContext.Provider>
  )
}
