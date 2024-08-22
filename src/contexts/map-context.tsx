'use client'
import { FlyToInterpolator, type MapViewState } from '@deck.gl/core'
import type { DeckGLRef } from '@deck.gl/react'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  useRef,
  useState,
} from 'react'
import type { MapRef } from 'react-map-gl'

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
import { type UseRadars, useRadars } from '@/hooks/map-layers/use-radars'
import { type UseTrips, useTrips } from '@/hooks/map-layers/use-trips'
import type { SetViewportProps } from '@/hooks/map-layers/use-trips-data'
import {
  type UseWazePoliceAlerts,
  useWazePoliceAlerts,
} from '@/hooks/map-layers/use-waze-police-alerts'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

interface MapContextProps {
  layers: {
    trips: UseTrips
    camerasCOR: UseCameraCOR
    radars: UseRadars
    addressMarker: UseAddressMarker
    wazePoliceAlerts: UseWazePoliceAlerts
    agents: UseAgents
    fogoCruzadoIncidents: UseFogoCruzadoIncidents
  }
  viewport: MapViewState
  setViewport: (props: SetViewportProps) => void
  deckRef: RefObject<DeckGLRef>
  mapRef: RefObject<MapRef>
  isMapStyleSatellite: boolean
  setIsMapStyleSatellite: Dispatch<SetStateAction<boolean>>
}

export const MapContext = createContext({} as MapContextProps)

interface MapContextProviderProps {
  children: ReactNode
}

export function MapContextProvider({ children }: MapContextProviderProps) {
  const [isMapStyleSatellite, setIsMapStyleSatellite] = useState(false)
  const [viewport, setViewportState] = useState<MapViewState>(INITIAL_VIEW_PORT)

  function setViewport(props: SetViewportProps) {
    setViewportState({
      ...viewport,
      ...props,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: 'auto',
    })
  }
  const camerasCOR = useCameraCOR()
  const radars = useRadars()
  const addressMarker = useAddressMarker()
  const wazePoliceAlerts = useWazePoliceAlerts()
  const trips = useTrips({ setViewport })
  const agents = useAgents()
  const fogoCruzadoIncidents = useFogoCruzadoIncidents()

  const deckRef = useRef<DeckGLRef>(null)
  const mapRef = useRef<MapRef>(null)

  return (
    <MapContext.Provider
      value={{
        layers: {
          camerasCOR,
          radars,
          addressMarker,
          wazePoliceAlerts,
          trips,
          agents,
          fogoCruzadoIncidents,
        },
        viewport,
        setViewport,
        mapRef,
        deckRef,
        isMapStyleSatellite,
        setIsMapStyleSatellite,
      }}
    >
      {children}
    </MapContext.Provider>
  )
}
