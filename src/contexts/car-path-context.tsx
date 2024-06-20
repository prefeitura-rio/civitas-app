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

  function setSelectedTripIndex(index: number) {
    setSelectedTripIndexState(index)
  }

  async function getCarPath({ placa, startTime, endTime }: GetCarPathRequest) {
    const response = await getCarPathApi({
      placa,
      startTime,
      endTime,
    })

    const formattedTrips = formatCarPathResponse(response.data)

    setTrips(formattedTrips)
    return formattedTrips
  }

  return (
    <CarPathContext.Provider
      value={{
        trips,
        getCarPath,
        selectedTripIndex,
        setSelectedTripIndex,
      }}
    >
      {children}
    </CarPathContext.Provider>
  )
}
