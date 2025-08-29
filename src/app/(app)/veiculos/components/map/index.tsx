'use client'

import 'mapbox-gl/dist/mapbox-gl.css'

import { type Deck, DeckGL } from 'deck.gl'
import { type MouseEvent, useEffect, useRef } from 'react'
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
      },
      cameras: {
        layer: cameraLayer,
        data: cameras,
        handleSelectObject: selectCamera,
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

  const layers = [
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
  ]

  function onRightClick(e: MouseEvent) {
    e.preventDefault()
    const y = e.clientY
    const x = e.clientX - 56
    const info = deckRef.current?.pickObject({ x, y, radius: 0 })
    setContextMenuPickingInfo(info || null)
    setOpenContextMenu(!!info)
  }

  function onLeftClick(e: MouseEvent) {
    e.preventDefault()
    const y = e.clientY
    const x = e.clientX - 56
    const info = deckRef.current?.pickObject({ x, y, radius: 0 })

    if (info?.layer?.id === 'radars' && info.object) {
      selectRadar(info.object as Radar)
    }

    if (info?.layer?.id === 'cameras' && info.object) {
      selectCamera(info.object as CameraCOR)
    }
  }

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
        layers={layers}
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
          onSubmit={(props) => {
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
          }}
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
