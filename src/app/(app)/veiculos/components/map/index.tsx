'use client'

import 'mapbox-gl/dist/mapbox-gl.css'

import { type Deck, DeckGL } from 'deck.gl'
import { useRef } from 'react'
import MapGl, { type MapRef } from 'react-map-gl'

import { MapSizeMonitor } from '@/components/custom/map-size-monitor'
import { useMapLayers } from '@/hooks/maps/use-map-layers'
import { useMapSearch } from '@/hooks/maps/use-map-search'
import { useMapState } from '@/hooks/maps/use-map-state'
import { useMouseInteractions } from '@/hooks/maps/use-mouse-interactions'
import { useSelectionManagement } from '@/hooks/maps/use-selection-management'
import { useMap } from '@/hooks/useContexts/use-map-context'

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
    contextMenuPickingInfo,
    openContextMenu,
    setContextMenuPickingInfo,
    setOpenContextMenu,
    zoomToLocation,
  } = useMap()

  const mapState = useMapState({ mapRef, deckRef })
  const mapLayers = useMapLayers()
  const mapSearch = useMapSearch({
    radars: mapLayers.radars,
    cameras: mapLayers.cameras,
    setViewport: mapState.setViewport,
  })

  const mouseInteractions = useMouseInteractions({
    deckRef,
    multiSelectRadar: mapLayers.multiSelectRadar,
    selectCamera: mapLayers.selectCamera,
    setSelectedRadar: mapLayers.setSelectedRadar,
    setSelectedCamera: mapLayers.setSelectedCamera,
    setContextMenuPickingInfo,
    setOpenContextMenu,
    zoomToLocation,
  })

  useSelectionManagement({
    selectedRadar: mapLayers.selectedRadar,
    selectedCamera: mapLayers.selectedCamera,
    setSelectedCamera: mapLayers.setSelectedCamera,
  })

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onContextMenu={mouseInteractions.handleRightClick}
      onMouseDown={mouseInteractions.handleMouseDown}
      onMouseMove={mouseInteractions.handleMouseMove}
      onMouseUp={mouseInteractions.handleMouseUp}
      onClick={mouseInteractions.handleLeftClick}
    >
      <MapSizeMonitor />

      <DeckGL
        ref={deckRef}
        initialViewState={mapState.viewport}
        controller
        onResize={() => mapRef.current?.resize()}
        layers={mapLayers.mapLayers}
        onViewStateChange={mapState.handleViewStateChange}
        getCursor={mapState.getCursor}
      >
        <MapGl
          ref={mapRef}
          mapStyle={mapState.mapStyleValue}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        />
      </DeckGL>

      <div className="absolute-x-centered top-2 z-50 w-64">
        <SearchBox
          isVisible={mapLayers.isAddressVisible}
          setIsVisible={mapLayers.setIsAddressVisible}
          setAddressMarker={mapLayers.setAddressMarker}
          setViewport={mapState.setViewport}
          onSubmit={mapSearch.handleSearchSubmit}
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
