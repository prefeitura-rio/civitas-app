'use client'
import { FlyToInterpolator, type MapViewState } from '@deck.gl/core'
import type { DeckGLRef } from '@deck.gl/react'
import {
  createContext,
  type ReactNode,
  type RefObject,
  useRef,
  useState,
} from 'react'
import type { MapRef } from 'react-map-gl'

import { getEnv } from '@/env/server'
import {
  type UseAddressMarker,
  useAddressMarker,
} from '@/hooks/map-layers/use-address-marker'
import {
  type UseReports,
  useReports,
} from '@/hooks/map-layers/use-reports-layer'
import type { SetViewportProps } from '@/models/utils'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

interface ReportsMapContextProps {
  layers: {
    reports: UseReports
    addressMarker: UseAddressMarker
  }
  viewport: MapViewState
  setViewport: (props: SetViewportProps) => void
  deckRef: RefObject<DeckGLRef>
  mapRef: RefObject<MapRef>
  mapboxAccessToken: string | undefined
}

export const ReportsMapContext = createContext({} as ReportsMapContextProps)

interface ReportsMapContextProviderProps {
  children: ReactNode
}

export function ReportsMapContextProvider({
  children,
}: ReportsMapContextProviderProps) {
  const [viewport, setViewportState] = useState<MapViewState>(INITIAL_VIEW_PORT)
  const [mapboxAccessToken, setMapboxAccessToken] = useState<
    string | undefined
  >(undefined)

  function setViewport(props: SetViewportProps) {
    setViewportState({
      ...viewport,
      ...props,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: 'auto',
    })
  }
  const deckRef = useRef<DeckGLRef>(null)
  const mapRef = useRef<MapRef>(null)

  const reports = useReports()
  const addressMarker = useAddressMarker()

  getEnv().then((env) => setMapboxAccessToken(env.MAPBOX_ACCESS_TOKEN))

  return (
    <ReportsMapContext.Provider
      value={{
        layers: {
          reports,
          addressMarker,
        },
        viewport,
        setViewport,
        mapRef,
        deckRef,
        mapboxAccessToken,
      }}
    >
      {children}
    </ReportsMapContext.Provider>
  )
}
