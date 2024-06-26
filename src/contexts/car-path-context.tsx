import type { MapViewState } from '@deck.gl/core'
import { createContext, type ReactNode, useState } from 'react'

import type { GetCarPathRequest } from '@/http/cars/get-car-path'
import { getCarPath as getCarPathApi } from '@/http/cars/get-car-path'
import { formatCarPathResponse, type Trip } from '@/utils/formatCarPathResponse'
import { tripsExample } from '@/utils/tripsExample'

interface CarPathContextProps {
  trips: Trip[] | undefined
  getCarPath: (props: GetCarPathRequest) => Promise<Trip[]>
  selectedTripIndex: number
  setSelectedTripIndex: (index: number) => void
  viewport: MapViewState
  setViewport: (viewport: MapViewState) => void
}

export const CarPathContext = createContext({} as CarPathContextProps)

interface CarPathContextProviderProps {
  children: ReactNode
}

export function CarPathContextProvider({
  children,
}: CarPathContextProviderProps) {
  const [trips, setTrips] = useState<Trip[]>(
    formatCarPathResponse(tripsExample),
  )
  const [selectedTripIndex, setSelectedTripIndexState] = useState(0)
  const [viewport, setViewportState] = useState<MapViewState>({
    longitude: -43.47,
    latitude: -22.92957,
    zoom: 10.1,
  })

  function setSelectedTripIndex(index: number) {
    setSelectedTripIndexState(index)
  }

  function setViewport(newViewport: MapViewState) {
    setViewportState(newViewport)
  }

  async function getCarPath({ placa, startTime, endTime }: GetCarPathRequest) {
    const response = await getCarPathApi({
      placa,
      startTime,
      endTime,
    })

    const formattedTrips = formatCarPathResponse(response.data)
    setTrips(formattedTrips)
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
        getCarPath,
        selectedTripIndex,
        setSelectedTripIndex,
        viewport,
        setViewport,
      }}
    >
      {children}
    </CarPathContext.Provider>
  )
}
