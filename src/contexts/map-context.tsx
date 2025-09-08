/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {
  FlyToInterpolator,
  type MapViewState,
  type PickingInfo,
} from '@deck.gl/core'
import type { DeckGLRef } from 'deck.gl'
import { createContext, type ReactNode, useState } from 'react'
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
import { MapStyle } from '@/utils/get-map-style'
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

export function MapContextProvider({ children }: MapContextProviderProps) {
  const [viewport, setViewportState] = useState<MapViewState>(INITIAL_VIEW_PORT)
  const [mapStyle, setMapStyle] = useState<MapStyle>(MapStyle.Map)
  const [mapRef, setMapRef] = useState<MapRef | null>(null)
  const [deckRef, setDeckRef] = useState<DeckGLRef | null>(null)
  const [openContextMenu, setOpenContextMenu] = useState(false)
  const [contextMenuPickingInfo, setContextMenuPickingInfo] =
    useState<PickingInfo | null>(null)
  // Estados para seleção múltipla de radares
  const [multipleSelectedRadars, setMultipleSelectedRadars] = useState<
    string[]
  >([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  // Sistema de histórico de viewport para zoom
  const [previousViewport, setPreviousViewport] = useState<MapViewState | null>(
    null,
  )

  function setViewport(props: SetViewportProps) {
    setViewportState({
      ...viewport,
      ...props,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: 'auto',
    })
  }

  // Função inteligente para zoom que respeita o zoom manual do usuário
  function zoomToLocation(
    latitude: number,
    longitude: number,
    zoom: number = 18,
    forceZoom: boolean = false,
  ) {
    const currentZoom = viewport.zoom || 0

    // Se o usuário já está com zoom maior que o zoom automático, não força o zoom
    // A menos que forceZoom seja true
    if (!forceZoom && currentZoom > zoom) {
      return
    }

    // Salva o viewport atual antes de fazer zoom automático
    setPreviousViewport(viewport)

    setViewport({
      latitude,
      longitude,
      zoom,
    })
  }

  // Função para restaurar o viewport anterior
  function restorePreviousViewport() {
    if (previousViewport) {
      setViewport(previousViewport)
      setPreviousViewport(null)
    }
  }

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
