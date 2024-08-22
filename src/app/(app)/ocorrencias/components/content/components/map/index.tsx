'use client'
import { DeckGL } from '@deck.gl/react'
import ReactMapGL from 'react-map-gl'

import { SearchBox } from '@/app/(app)/mapa/components/map/components/search-box'
import { config } from '@/config'
import { useReportsMap } from '@/hooks/use-contexts/use-reports-map-context'
import { cn } from '@/lib/utils'

import { MapActions } from './components/map-actions'
import { ReportHoverCard } from './components/report-hover-card'

interface MapProps {
  className?: string
}

export function Map({ className }: MapProps) {
  const {
    deckRef,
    mapRef,
    viewport,
    setViewport,
    layers: { reports, addressMarker },
  } = useReportsMap()

  const bounds = mapRef.current?.getBounds().toArray().flat() || [0, 0, 0, 0]
  const zoom = viewport.zoom

  return (
    <div className={cn(className, 'h-full')}>
      <DeckGL
        ref={deckRef}
        initialViewState={viewport}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
        onResize={() => mapRef?.current?.resize()}
        controller
        layers={[
          reports.layers.heatmap,
          ...reports.layers.clusteredIcons(bounds, zoom),
          addressMarker.layer,
        ]}
        onViewStateChange={(e) => setViewport({ ...e.viewState })}
        getCursor={({ isDragging, isHovering }) => {
          if (isDragging) return 'grabbing'
          else if (isHovering) {
            return 'pointer'
          }
          return 'grab'
        }}
      >
        <ReactMapGL
          ref={mapRef}
          mapboxAccessToken={config.mapboxAccessToken}
          mapStyle={'mapbox://styles/mapbox/streets-v12'}
        />
        <div className="absolute-x-centered top-2 z-50 w-64">
          <SearchBox
            isVisible={addressMarker.layerStates.isVisible}
            setIsVisible={addressMarker.layerStates.setIsVisible}
            setAddressMarker={addressMarker.layerStates.setAddressMarker}
            setViewport={setViewport}
          />
        </div>
        <MapActions />
        <ReportHoverCard />
      </DeckGL>
    </div>
  )
}
