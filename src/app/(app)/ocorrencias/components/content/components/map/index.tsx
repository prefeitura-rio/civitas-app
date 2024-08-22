import { DeckGL } from '@deck.gl/react'
import ReactMapGL from 'react-map-gl'

import { SearchBox } from '@/app/(app)/mapa/components/map/components/search-box'
import { config } from '@/config'
import { useReportsMap } from '@/hooks/use-contexts/use-reports-map-context'
import { cn } from '@/lib/utils'

import { ReportHoverInfoTooltip } from './components/report-hover-info-tooltip'

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
        layers={[reports.layer, addressMarker.layer]}
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
        <ReportHoverInfoTooltip />
      </DeckGL>
    </div>
  )
}
