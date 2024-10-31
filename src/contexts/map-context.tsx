'use client'
import { FlyToInterpolator, type MapViewState } from '@deck.gl/core'
import { createContext, type ReactNode, useState } from 'react'

import {
  type UseAddressMarker,
  useAddressMarker,
} from '@/hooks/map-layers/use-address-marker'
import { type UseAgents, useAgents } from '@/hooks/map-layers/use-agents'
import { type UseCameraCOR, useCameraCOR } from '@/hooks/map-layers/use-cameras'
import {
  type UseFogoCruzadoIncidents,
  useFogoCruzadoIncidents,
} from '@/hooks/map-layers/use-fogo-cruzado'
import {
  type UseRadarLayer,
  useRadarLayer,
} from '@/hooks/map-layers/use-radar-layer'
import { type UseTrips, useTrips } from '@/hooks/map-layers/use-trips'
import {
  type UseWazePoliceAlerts,
  useWazePoliceAlerts,
} from '@/hooks/map-layers/use-waze-police-alerts'
import type { SetViewportProps } from '@/models/utils'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

interface MapContextProps {
  layers: {
    radars: UseRadarLayer
    trips: UseTrips
    cameras: UseCameraCOR
    agents: UseAgents
    fogoCruzado: UseFogoCruzadoIncidents
    waze: UseWazePoliceAlerts
    address: UseAddressMarker
  }
  viewport: MapViewState
  setViewport: (props: SetViewportProps) => void
}

export const MapContext = createContext({} as MapContextProps)

interface MapContextProviderProps {
  children: ReactNode
}

export function MapContextProvider({ children }: MapContextProviderProps) {
  const [viewport, setViewportState] = useState<MapViewState>(INITIAL_VIEW_PORT)

  function setViewport(props: SetViewportProps) {
    setViewportState({
      ...viewport,
      ...props,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: 'auto',
    })
  }

  const radars = useRadarLayer()
  const trips = useTrips({ setViewport })
  const cameras = useCameraCOR()
  const agents = useAgents()
  const fogoCruzado = useFogoCruzadoIncidents()
  const waze = useWazePoliceAlerts()
  const address = useAddressMarker()

  return (
    <MapContext.Provider
      value={{
        layers: {
          radars,
          trips,
          cameras,
          agents,
          fogoCruzado,
          waze,
          address,
        },
        viewport,
        setViewport,
      }}
    >
      {children}
    </MapContext.Provider>
  )
}
