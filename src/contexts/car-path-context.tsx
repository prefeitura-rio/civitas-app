import { FlyToInterpolator, type MapViewState } from '@deck.gl/core'
import { createContext, type ReactNode, useState } from 'react'

import {
  getCarPath as getCarPathApi,
  GetCarPathRequest,
} from '@/http/cars/path/get-car-path'
import { formatCarPathResponse, type Trip } from '@/utils/formatCarPathResponse'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

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
  const [viewport, setViewportState] = useState<MapViewState>(INITIAL_VIEW_PORT)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSearchParams, setLastSearchParams] = useState<GetCarPathRequest>()

  function setSelectedTripIndex(index: number) {
    setSelectedTripIndexState(index)
    if (trips) {
      setSelectedTrip(trips?.at(index))
    }
  }

  function setViewport(newViewport: MapViewState) {
    setViewportState({
      ...newViewport,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: 'auto',
    })
    // setViewportState(newViewport)
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
    setSelectedTrip(formattedTrips[0])
    setSelectedTripIndexState(0)
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
