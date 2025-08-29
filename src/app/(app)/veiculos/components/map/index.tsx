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
  }, [])

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

  const onRightClick = useCallback(
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

  const onLeftClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      const y = e.clientY
      const x = e.clientX - 56
      const info = deckRef.current?.pickObject({ x, y, radius: 0 })

      if (info?.layer?.id === 'radars' && info.object) {
        // Seleciona o radar e limpa a câmera
        selectRadar(info.object as Radar)
        // Limpa a câmera selecionada
        setSelectedCamera(null)
      }

      if (info?.layer?.id === 'cameras' && info.object) {
        // Seleciona a câmera e limpa o radar
        selectCamera(info.object as CameraCOR)
        // Limpa o radar selecionado
        setSelectedRadar(null)
      }
    },
    [selectRadar, selectCamera, setSelectedCamera, setSelectedRadar],
  )

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onContextMenu={onRightClick}
      onClick={onLeftClick}
    >
      <DeckGL
        ref={deckRef}
        initialViewState={viewport}
        controller
        onResize={() => mapRef.current?.resize()}
        layers={mapLayers}
        onViewStateChange={(e) => setViewport({ ...e.viewState })}
        getCursor={({ isDragging, isHovering }) => {
          if (isDragging) return 'grabbing'
          if (isHovering) return 'pointer'
          return 'grab'
        }}
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
          onSubmit={useCallback(
            (props) => {
              const id = props.address
              const trimmedId = id.replace(/^0+/, '')
              const radar = radars?.find((r) => {
                const trimmedCetRioCode = r.cetRioCode?.replace(/^0+/, '')
                return trimmedCetRioCode === trimmedId
              })
              if (radar) {
                setViewport({
                  latitude: radar.latitude,
                  longitude: radar.longitude,
                  zoom: 20,
                })
                return
              }
              const camera = cameras?.find((c) => {
                const trimmedCode = c.code.replace(/^0+/, '')
                const trimmedId = id.replace(/^0+/, '')
                return trimmedCode === trimmedId
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
          )}
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
