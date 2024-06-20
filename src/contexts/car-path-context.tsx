import { createContext, type ReactNode, useState } from 'react'

import type {
  GetCarPathRequest,
  GetCarPathResponse,
} from '@/http/cars/get-car-path'
import { getCarPath as getCarPathApi } from '@/http/cars/get-car-path'

interface CarPathContextProps {
  // ...
  carPath: GetCarPathResponse | undefined
  getCarPath: (props: GetCarPathRequest) => Promise<GetCarPathResponse>
}

export const CarPathContext = createContext({} as CarPathContextProps)

interface CarPathContextProviderProps {
  children: ReactNode
}

export function CarPathContextProvider({
  children,
}: CarPathContextProviderProps) {
  const [carPath, setCarPath] = useState<GetCarPathResponse>()

  async function getCarPath({ placa, startTime, endTime }: GetCarPathRequest) {
    const response = await getCarPathApi({
      placa,
      startTime,
      endTime,
    })

    setCarPath(response.data)
    return response.data
  }

  return (
    <CarPathContext.Provider
      value={{
        carPath,
        getCarPath,
      }}
    >
      {children}
    </CarPathContext.Provider>
  )
}
