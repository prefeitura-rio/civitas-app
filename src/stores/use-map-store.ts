/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FlyToInterpolator,
  type MapViewState,
  type PickingInfo,
} from '@deck.gl/core'
import type { DeckGLRef } from 'deck.gl'
import type { MapRef } from 'react-map-gl'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { useAddressMarker } from '@/hooks/mapLayers/use-address-marker'
import { useAgents } from '@/hooks/mapLayers/use-agents'
import { useAISPLayer } from '@/hooks/mapLayers/use-AISP-layer'
import { useBusStopLayer } from '@/hooks/mapLayers/use-bus-stop-layer'
import { useCameraCOR } from '@/hooks/mapLayers/use-cameras'
import { useCISPLayer } from '@/hooks/mapLayers/use-CISP-layer'
import { useFogoCruzadoIncidents } from '@/hooks/mapLayers/use-fogo-cruzado'
import { useRadarLayer } from '@/hooks/mapLayers/use-radar-layer'
import { useSchoolLayer } from '@/hooks/mapLayers/use-school-layer'
import { useTrips } from '@/hooks/mapLayers/use-trips'
import { useWazePoliceAlerts } from '@/hooks/mapLayers/use-waze-police-alerts'
import type { SetViewportProps } from '@/models/utils'
import { MapStyle } from '@/utils/get-map-style'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

interface MapStore {
  // Viewport
  viewport: MapViewState
  setViewportState: (viewport: MapViewState) => void
  setViewport: (props: SetViewportProps) => void

  // Map Style
  mapStyle: MapStyle
  setMapStyle: (style: MapStyle) => void

  // Map Refs
  mapRef: MapRef | null
  setMapRef: (ref: MapRef | null) => void
  deckRef: DeckGLRef<any> | null
  setDeckRef: (ref: DeckGLRef<any> | null) => void

  // Context Menu
  openContextMenu: boolean
  setOpenContextMenu: (open: boolean) => void
  contextMenuPickingInfo: PickingInfo | null
  setContextMenuPickingInfo: (info: PickingInfo | null) => void

  // Multiple Selection
  multipleSelectedRadars: string[]
  setMultipleSelectedRadars: (
    radarsOrUpdater: string[] | ((prev: string[]) => string[]),
  ) => void
  isMultiSelectMode: boolean
  setIsMultiSelectMode: (enabled: boolean) => void

  // Viewport History
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

export const useMapStore = create<MapStore>()(
  subscribeWithSelector((set, get) => ({
    // Viewport
    viewport: INITIAL_VIEW_PORT,
    setViewportState: (viewport) => set({ viewport }),
    setViewport: (props) => {
      const currentViewport = get().viewport
      set({
        viewport: {
          ...currentViewport,
          ...props,
          transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
          transitionDuration: 'auto',
        },
      })
    },

    // Map Style
    mapStyle: MapStyle.Map,
    setMapStyle: (mapStyle) => set({ mapStyle }),

    // Map Refs
    mapRef: null,
    setMapRef: (mapRef) => set({ mapRef }),
    deckRef: null,
    setDeckRef: (deckRef) => set({ deckRef }),

    // Context Menu
    openContextMenu: false,
    setOpenContextMenu: (openContextMenu) => set({ openContextMenu }),
    contextMenuPickingInfo: null,
    setContextMenuPickingInfo: (contextMenuPickingInfo) =>
      set({ contextMenuPickingInfo }),

    // Multiple Selection
    multipleSelectedRadars: [],
    setMultipleSelectedRadars: (multipleSelectedRadarsOrUpdater) => {
      const currentRadars = get().multipleSelectedRadars
      const newRadars =
        typeof multipleSelectedRadarsOrUpdater === 'function'
          ? multipleSelectedRadarsOrUpdater(currentRadars)
          : multipleSelectedRadarsOrUpdater

      console.log('🏪 Zustand Store - setMultipleSelectedRadars called', {
        isFunction: typeof multipleSelectedRadarsOrUpdater === 'function',
        currentRadars,
        newRadars,
        changed: JSON.stringify(currentRadars) !== JSON.stringify(newRadars),
      })

      set({ multipleSelectedRadars: newRadars })
    },
    isMultiSelectMode: false,
    setIsMultiSelectMode: (isMultiSelectMode) => set({ isMultiSelectMode }),

    // Viewport History
    previousViewport: null,
    setPreviousViewport: (previousViewport) => set({ previousViewport }),
    zoomToLocation: (latitude, longitude, zoom = 18, forceZoom = false) => {
      const { viewport, setViewport, setPreviousViewport } = get()
      const currentZoom = viewport.zoom || 0

      console.log('zoomToLocation called:', {
        currentZoom,
        targetZoom: zoom,
        forceZoom,
        willZoom: forceZoom || currentZoom <= zoom,
      })

      // Se o usuário já está com zoom maior que o zoom automático, não força o zoom
      // A menos que forceZoom seja true
      if (!forceZoom && currentZoom > zoom) {
        console.log('Zoom skipped - user has higher zoom')
        return
      }

      // Salva o viewport atual antes de fazer zoom automático
      setPreviousViewport(viewport)

      setViewport({
        latitude,
        longitude,
        zoom,
      })
    },
    restorePreviousViewport: () => {
      const { previousViewport, setViewport, setPreviousViewport } = get()
      if (previousViewport) {
        setViewport(previousViewport)
        setPreviousViewport(null)
      }
    },
  })),
)

// Hook para usar layers - otimizado para performance
export function useMapLayers() {
  const multipleSelectedRadars = useMapStore(
    (state) => state.multipleSelectedRadars,
  )
  const setViewport = useMapStore((state) => state.setViewport)

  // Estes hooks são executados apenas uma vez por componente
  // Os layers são memoizados internamente
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

  return {
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
  }
}

// Hooks seletores específicos para melhor performance
export const useViewport = () => useMapStore((state) => state.viewport)
export const useMapStyle = () => useMapStore((state) => state.mapStyle)
export const useMapRefs = () =>
  useMapStore((state) => ({
    mapRef: state.mapRef,
    deckRef: state.deckRef,
  }))
export const useContextMenu = () =>
  useMapStore((state) => ({
    openContextMenu: state.openContextMenu,
    contextMenuPickingInfo: state.contextMenuPickingInfo,
  }))
export const useMultipleSelection = () =>
  useMapStore((state) => ({
    multipleSelectedRadars: state.multipleSelectedRadars,
    isMultiSelectMode: state.isMultiSelectMode,
  }))
export const useViewportHistory = () =>
  useMapStore((state) => ({
    previousViewport: state.previousViewport,
  }))
