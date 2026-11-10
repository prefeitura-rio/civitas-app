'use client'

import 'mapbox-gl/dist/mapbox-gl.css'

import { type Deck, DeckGL } from 'deck.gl'
import { useCallback, useRef } from 'react'
import MapGl, { type MapRef } from 'react-map-gl'

import { useClusteredMapLayers } from '@/hooks/maps/use-clustered-map-layers'
import { useMapLayers } from '@/hooks/maps/use-map-layers'
import { useMapSearch } from '@/hooks/maps/use-map-search'
import { useMapState } from '@/hooks/maps/use-map-state'
import { useMouseInteractions } from '@/hooks/maps/use-mouse-interactions'
import { useSelectionManagement } from '@/hooks/maps/use-selection-management'
import { type MapSize, useMapSize } from '@/hooks/use-map-size'
import { useMap } from '@/hooks/useContexts/use-map-context'

import { MAPBOX_ACCESS_TOKEN } from './components/constants'
import { ContextMenu } from './components/context-menu'
import { HoverCards } from './components/hover-cards'
import { MapLayerControl } from './components/layer-toggle'
import { MapFloatingControls } from './components/map-floating-controls'
import { SearchBox } from './components/search-box'
import { SelectionCards } from './components/select-cards'

export function Map() {
  const deckRef = useRef<Deck | null>(null)
  const mapRef = useRef<MapRef | null>(null)

  const {
    clusterMode,
    contextMenuPickingInfo,
    openContextMenu,
    setContextMenuPickingInfo,
    setOpenContextMenu,
    zoomToLocation,
  } = useMap()

  const mapState = useMapState({ mapRef, deckRef })
  const mapLayers = useMapLayers()
  const { mapSize, handleResize } = useMapSize()
  const handleMapResize = useCallback(
    (dimensions: MapSize) => {
      handleResize(dimensions)
      mapRef.current?.resize()
    },
    [handleResize],
  )
  const clusteredMap = useClusteredMapLayers(
    mapLayers.mapLayers,
    mapLayers.pointSources,
    mapState.viewport,
    mapSize,
    mapState.setViewport,
    clusterMode === 'auto',
  )
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
      <DeckGL
        ref={deckRef}
        initialViewState={mapState.viewport}
        controller={{ dragRotate: false, touchRotate: false }}
        onResize={handleMapResize}
        layers={clusteredMap.layers}
        onViewStateChange={mapState.handleViewStateChange}
        getCursor={mapState.getCursor}
      >
        <MapGl
          ref={mapRef}
          mapStyle={mapState.mapStyleValue}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          dragRotate={false}
          pitchWithRotate={false}
          touchPitch={false}
          maxPitch={0}
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
      <SelectionCards mapWidth={mapSize?.width} />
      <HoverCards />
      <MapLayerControl />
      <MapFloatingControls />
      {clusteredMap.hoveredCluster ? (
        <div className="absolute right-3 top-14 z-40 min-w-48 rounded-md border bg-background px-3 py-2 text-xs shadow-md">
          <p className="font-semibold text-foreground">
            {`${clusteredMap.hoveredCluster.properties.point_count} pontos`}
          </p>
          {Object.entries(clusteredMap.hoveredOriginCounts).map(
            ([origin, count]) => (
              <p key={origin} className="text-muted-foreground">
                {origin}: {count}
              </p>
            ),
          )}
        </div>
      ) : null}
      <ContextMenu
        open={openContextMenu}
        onOpenChange={setOpenContextMenu}
        pickingInfo={contextMenuPickingInfo}
      />
    </div>
  )
}
