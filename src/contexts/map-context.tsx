'use client'
import { FlyToInterpolator, type MapViewState } from '@deck.gl/core'
import { createContext, type ReactNode, useState } from 'react'

import { type UseCameraCOR, useCameraCOR } from '@/hooks/map-layers/use-cameras'
import {
  type UseRadarLayer,
  useRadarLayer,
} from '@/hooks/map-layers/use-radar-layer'
import { type UseTrips, useTrips } from '@/hooks/map-layers/use-trips'
import type { SetViewportProps } from '@/hooks/map-layers-[old]/use-trips-data'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

interface MapContextProps {
  layers: {
    radars: UseRadarLayer
    trips: UseTrips
    cameras: UseCameraCOR
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

  return (
    <MapContext.Provider
      value={{
        layers: {
          radars,
          trips,
          cameras,
        },
        viewport,
        setViewport,
      }}
    >
      {children}
    </MapContext.Provider>
  )
}
