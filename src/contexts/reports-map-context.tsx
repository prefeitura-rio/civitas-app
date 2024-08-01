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

import {
  type UseAddressMarker,
  useAddressMarker,
} from '@/hooks/map-layers/use-address-marker'
import { type UseReports, useReports } from '@/hooks/map-layers/use-reports'
import type { SetViewportProps } from '@/hooks/map-layers/use-trips-data'
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
}

export const ReportsMapContext = createContext({} as ReportsMapContextProps)

interface ReportsMapContextProviderProps {
  children: ReactNode
}

export function ReportsMapContextProvider({
  children,
}: ReportsMapContextProviderProps) {
  const [viewport, setViewportState] = useState<MapViewState>(INITIAL_VIEW_PORT)

  function setViewport(props: SetViewportProps) {
    setViewportState({
      ...viewport,
      ...props,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: 'auto',
    })
  }
  const reports = useReports()
  const addressMarker = useAddressMarker()

  const deckRef = useRef<DeckGLRef>(null)
  const mapRef = useRef<MapRef>(null)

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
      }}
    >
      {children}
    </ReportsMapContext.Provider>
  )
}
