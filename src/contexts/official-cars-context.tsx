import type { MapViewState } from '@deck.gl/core'
import { useQuery } from '@tanstack/react-query'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from 'react'
import { toast } from 'sonner'

import { getAgentsLocation } from '@/http/agents/get-agents-location'
import type { AgentLocation } from '@/models/entities'
import { genericErrorMessage } from '@/utils/error-handlers'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

interface OfficialCarsContextProps {
  viewport: MapViewState
  setViewport: Dispatch<SetStateAction<MapViewState>>
  cars: AgentLocation[]
}

export const OfficialCarsContext = createContext({} as OfficialCarsContextProps)

interface OfficialCarsContextProviderProps {
  children: ReactNode
}

export function OfficialCarsContextProvider({
  children,
}: OfficialCarsContextProviderProps) {
  const [viewport, setViewport] = useState(INITIAL_VIEW_PORT)
  const [cars, setCars] = useState<AgentLocation[]>([])

  useQuery({
    queryKey: ['agent/locations'],
    queryFn: async () => {
      try {
        const response = await getAgentsLocation()
        setCars(response.data)
        return response.data
      } catch (error) {
        toast.error(genericErrorMessage)
        throw error
      }
    },
    refetchInterval: 1000 * 60, // 1 min
  })

  return (
    <OfficialCarsContext.Provider value={{ viewport, setViewport, cars }}>
      {children}
    </OfficialCarsContext.Provider>
  )
}
