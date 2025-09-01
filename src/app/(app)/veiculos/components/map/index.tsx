'use client'

import 'mapbox-gl/dist/mapbox-gl.css'

import { type Deck, DeckGL } from 'deck.gl'
import { type MouseEvent, useCallback, useEffect, useMemo, useRef } from 'react'
import MapGl, { type MapRef } from 'react-map-gl'

import { useMap } from '@/hooks/useContexts/use-map-context'
import type { CameraCOR, Radar } from '@/models/entities'
import { getMapStyle } from '@/utils/get-map-style'

import { MAPBOX_ACCESS_TOKEN } from './components/constants'
import { ContextMenu } from './components/context-menu'
import { HoverCards } from './components/hover-cards'
import { MapLayerControl } from './components/layer-toggle'
import { SearchBox } from './components/search-box'
import { SelectionCards } from './components/select-cards'

interface SearchSubmitProps {
  address: string
}

type CursorParams = {
  isDragging: boolean
  isHovering: boolean
}

export function Map() {
  const deckRef = useRef<Deck | null>(null)
  const mapRef = useRef<MapRef | null>(null)

  const {
    layers: {
      radars: {
        layer: radarLayer,
        data: radars,
        handleSelectObject: selectRadar,
        setSelectedObject: setSelectedRadar,
      },
      cameras: {
        layer: cameraLayer,
        data: cameras,
        handleSelectObject: selectCamera,
        setSelectedObject: setSelectedCamera,
      },
      agents: { layer: agentsLayer },
      fogoCruzado: { layer: fogoCruzadoLayer },
      waze: { layer: wazeLayer },
      trips: { layers: tripLayers },
      address: {
        layerStates: {
          isVisible: isAddressVisible,
          setIsVisible: setIsAddressVisible,
          setAddressMarker,
        },
        layer: addressLayer,
      },
      AISP: { layers: AISPLayer },
      CISP: { layers: CISPLayer },
      schools: { layers: schoolsLayer },
      busStops: { layers: busStopsLayer },
    },
    viewport,
    setViewport,
    mapStyle,
    setMapRef,
    setDeckRef,
    contextMenuPickingInfo,
    openContextMenu,
    setContextMenuPickingInfo,
    setOpenContextMenu,
  } = useMap()

  useEffect(() => {
    setMapRef(mapRef.current)
    setDeckRef(deckRef.current)
  }, [setMapRef, setDeckRef])

  const mapLayers = useMemo(
    () => [
      ...AISPLayer,
      ...CISPLayer,
      cameraLayer,
      radarLayer,
      wazeLayer,
      fogoCruzadoLayer,
      agentsLayer,
      ...tripLayers,
      addressLayer,
      schoolsLayer,
      busStopsLayer,
    ],
    [
      AISPLayer,
      CISPLayer,
      cameraLayer,
      radarLayer,
      wazeLayer,
      fogoCruzadoLayer,
      agentsLayer,
      tripLayers,
      addressLayer,
      schoolsLayer,
      busStopsLayer,
    ],
  )

  const handleRightClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      const y = e.clientY
      const x = e.clientX - 56
      const info = deckRef.current?.pickObject({ x, y, radius: 0 })
      setContextMenuPickingInfo(info || null)
      setOpenContextMenu(!!info)
    },
    [setContextMenuPickingInfo, setOpenContextMenu],
  )

  const handleLeftClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      const y = e.clientY
      const x = e.clientX - 56
      const info = deckRef.current?.pickObject({ x, y, radius: 0 })

      if (info?.layer?.id === 'radars' && info.object) {
        selectRadar(info.object as Radar)
        setSelectedCamera(null)
      }

      if (info?.layer?.id === 'cameras' && info.object) {
        selectCamera(info.object as CameraCOR)
        setSelectedRadar(null)
      }
    },
    [selectRadar, selectCamera, setSelectedCamera, setSelectedRadar],
  )

  const handleSearchSubmit = useCallback(
    (props: SearchSubmitProps) => {
      const { address } = props
      const trimmedAddress = address.replace(/^0+/, '')

      // Buscar radar
      const radar = radars?.find((r) => {
        const trimmedCetRioCode = r.cetRioCode?.replace(/^0+/, '')
        return trimmedCetRioCode === trimmedAddress
      })

      if (radar) {
        setViewport({
          latitude: radar.latitude,
          longitude: radar.longitude,
          zoom: 20,
        })
        return
      }

      // Buscar câmera
      const camera = cameras?.find((c) => {
        const trimmedCode = c.code.replace(/^0+/, '')
        return trimmedCode === trimmedAddress
      })

      if (camera) {
        setViewport({
          latitude: camera.latitude,
          longitude: camera.longitude,
          zoom: 20,
        })
      }
    },
    [radars, cameras, setViewport],
  )

  const handleViewStateChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: { viewState: any }) => {
      setViewport({ ...e.viewState })
    },
    [setViewport],
  )

  const getCursor = useCallback((params: CursorParams) => {
    const { isDragging, isHovering } = params
    if (isDragging) return 'grabbing'
    if (isHovering) return 'pointer'
    return 'grab'
  }, [])

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onContextMenu={handleRightClick}
      onClick={handleLeftClick}
    >
      <DeckGL
        ref={deckRef}
        initialViewState={viewport}
        controller
        onResize={() => mapRef.current?.resize()}
        layers={mapLayers}
        onViewStateChange={handleViewStateChange}
        getCursor={getCursor}
      >
        <MapGl
          ref={mapRef}
          mapStyle={getMapStyle(mapStyle)}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        />
      </DeckGL>

      <div className="absolute-x-centered top-2 z-50 w-64">
        <SearchBox
          isVisible={isAddressVisible}
          setIsVisible={setIsAddressVisible}
          setAddressMarker={setAddressMarker}
          setViewport={setViewport}
          onSubmit={handleSearchSubmit}
        />
      </div>

      <SelectionCards />
      <HoverCards />
      <MapLayerControl />

      <ContextMenu
        open={openContextMenu}
        onOpenChange={setOpenContextMenu}
        pickingInfo={contextMenuPickingInfo}
      />
    </div>
  )
}
