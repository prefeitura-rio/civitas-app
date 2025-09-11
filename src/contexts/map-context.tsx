/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { type MapViewState, type PickingInfo } from '@deck.gl/core'
import type { DeckGLRef } from 'deck.gl'
import { createContext, type ReactNode } from 'react'
import type { MapRef } from 'react-map-gl'

import {
  type UseAddressMarker,
  useAddressMarker,
} from '@/hooks/mapLayers/use-address-marker'
import { type UseAgents, useAgents } from '@/hooks/mapLayers/use-agents'
import {
  type UseAISPLayer,
  useAISPLayer,
} from '@/hooks/mapLayers/use-AISP-layer'
import {
  type UseBusStopLayer,
  useBusStopLayer,
} from '@/hooks/mapLayers/use-bus-stop-layer'
import { type UseCameraCOR, useCameraCOR } from '@/hooks/mapLayers/use-cameras'
import {
  type UseCISPLayer,
  useCISPLayer,
} from '@/hooks/mapLayers/use-CISP-layer'
import {
  type UseFogoCruzadoIncidents,
  useFogoCruzadoIncidents,
} from '@/hooks/mapLayers/use-fogo-cruzado'
import {
  type UseRadarLayer,
  useRadarLayer,
} from '@/hooks/mapLayers/use-radar-layer'
import {
  type UseSchoolLayer,
  useSchoolLayer,
} from '@/hooks/mapLayers/use-school-layer'
import { type UseTrips, useTrips } from '@/hooks/mapLayers/use-trips'
import {
  type UseWazePoliceAlerts,
  useWazePoliceAlerts,
} from '@/hooks/mapLayers/use-waze-police-alerts'
import type { SetViewportProps } from '@/models/utils'
import { useMapStore } from '@/stores/use-map-store'
import { MapStyle } from '@/utils/get-map-style'

interface MapContextProps {
  layers: {
    radars: UseRadarLayer
    trips: UseTrips
    cameras: UseCameraCOR
    agents: UseAgents
    fogoCruzado: UseFogoCruzadoIncidents
    waze: UseWazePoliceAlerts
    address: UseAddressMarker
    CISP: UseCISPLayer
    AISP: UseAISPLayer
    schools: UseSchoolLayer
    busStops: UseBusStopLayer
  }
  viewport: MapViewState
  setViewport: (props: SetViewportProps) => void
  mapStyle: MapStyle
  setMapStyle: (style: MapStyle) => void
  mapRef: MapRef | null
  setMapRef: (ref: MapRef | null) => void
  setDeckRef: (ref: DeckGLRef<any> | null) => void
  deckRef: DeckGLRef<any> | null
  openContextMenu: boolean
  setOpenContextMenu: (open: boolean) => void
  contextMenuPickingInfo: PickingInfo | null
  setContextMenuPickingInfo: (info: PickingInfo | null) => void
  // Seleção múltipla de radares para busca
  multipleSelectedRadars: string[]
  setMultipleSelectedRadars: (radars: string[]) => void
  isMultiSelectMode: boolean
  setIsMultiSelectMode: (enabled: boolean) => void
  // Sistema de histórico de viewport para zoom
  previousViewport: MapViewState | null
  setPreviousViewport: (viewport: MapViewState | null) => void
  zoomToLocation: (
    latitude: number,
    longitude: number,
    zoom?: number,
    forceZoom?: boolean,
  ) => void
  restorePreviousViewport: () => void
}

export const MapContext = createContext({} as MapContextProps)

interface MapContextProviderProps {
  children: ReactNode
}

// Context compatível que usa Zustand por baixo dos panos
export function MapContextProvider({ children }: MapContextProviderProps) {
  // Estados do Zustand
  const viewport = useMapStore((state) => state.viewport)
  const setViewport = useMapStore((state) => state.setViewport)
  const mapStyle = useMapStore((state) => state.mapStyle)
  const setMapStyle = useMapStore((state) => state.setMapStyle)
  const mapRef = useMapStore((state) => state.mapRef)
  const setMapRef = useMapStore((state) => state.setMapRef)
  const deckRef = useMapStore((state) => state.deckRef)
  const setDeckRef = useMapStore((state) => state.setDeckRef)
  const openContextMenu = useMapStore((state) => state.openContextMenu)
  const setOpenContextMenu = useMapStore((state) => state.setOpenContextMenu)
  const contextMenuPickingInfo = useMapStore(
    (state) => state.contextMenuPickingInfo,
  )
  const setContextMenuPickingInfo = useMapStore(
    (state) => state.setContextMenuPickingInfo,
  )
  const multipleSelectedRadars = useMapStore(
    (state) => state.multipleSelectedRadars,
  )
  const setMultipleSelectedRadars = useMapStore(
    (state) => state.setMultipleSelectedRadars,
  )
  const isMultiSelectMode = useMapStore((state) => state.isMultiSelectMode)
  const setIsMultiSelectMode = useMapStore(
    (state) => state.setIsMultiSelectMode,
  )
  const previousViewport = useMapStore((state) => state.previousViewport)
  const setPreviousViewport = useMapStore((state) => state.setPreviousViewport)
  const zoomToLocation = useMapStore((state) => state.zoomToLocation)
  const restorePreviousViewport = useMapStore(
    (state) => state.restorePreviousViewport,
  )

  // Layers usando hooks tradicionais
  const radars = useRadarLayer(multipleSelectedRadars)
  const trips = useTrips({ setViewport })
  const cameras = useCameraCOR()
  const agents = useAgents()
  const fogoCruzado = useFogoCruzadoIncidents()
  const waze = useWazePoliceAlerts()
  const address = useAddressMarker()
  const CISP = useCISPLayer()
  const AISP = useAISPLayer()
  const schools = useSchoolLayer()
  const busStops = useBusStopLayer()

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
          CISP,
          AISP,
          schools,
          busStops,
        },
        viewport,
        setViewport,
        mapStyle,
        setMapStyle,
        mapRef,
        setMapRef,
        deckRef,
        setDeckRef,
        openContextMenu,
        setOpenContextMenu,
        contextMenuPickingInfo,
        setContextMenuPickingInfo,
        multipleSelectedRadars,
        setMultipleSelectedRadars,
        isMultiSelectMode,
        setIsMultiSelectMode,
        previousViewport,
        setPreviousViewport,
        zoomToLocation,
        restorePreviousViewport,
      }}
    >
      {children}
    </MapContext.Provider>
  )
}
