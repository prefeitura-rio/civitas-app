import DeckGL from '@deck.gl/react'
import ReactMapGL from 'react-map-gl'

import { config } from '@/config'
import { useMap } from '@/hooks/use-contexts/use-map-context'

import { IconTooltip } from './map/icon-tooltip/icon-tooltip'
import { MapActions } from './map/map-actions'
import { MapCaption } from './map/map-caption'
import { SearchBox } from './search-box'

export function Map() {
  const {
    layers: { camerasCOR, radars, addressMarker, wazePoliceAlerts, trips },
    deckRef,
    mapRef,
    viewport,
    setViewport,
    isMapStyleSatellite,
  } = useMap()

  return (
    <DeckGL
      ref={deckRef}
      initialViewState={viewport}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
      controller
      layers={[
        trips.layers.lineLayer,
        trips.layers.lineLayerTransparent,
        camerasCOR.layers.cameraCORLayer,
        radars.layers.radarLayer,
        wazePoliceAlerts.layer,
        camerasCOR.layers.selectedCameraCORLayer,
        radars.layers.selectedRadarLayer,
        radars.layers.slashInactiveRadarsLayer,
        trips.layers.coloredIconLayer,
        trips.layers.blackIconLayer,
        trips.layers.textLayer,
        addressMarker.layer,
      ]}
      onViewStateChange={(e) => setViewport({ ...e.viewState })}
      getCursor={({ isDragging }) =>
        isDragging
          ? 'grabbing'
          : camerasCOR.layerStates.hoverInfo
            ? 'pointer'
            : 'grab'
      }
    >
      <ReactMapGL
        ref={mapRef}
        mapboxAccessToken={config.mapboxAccessToken}
        mapStyle={
          isMapStyleSatellite
            ? 'mapbox://styles/mapbox/satellite-streets-v12'
            : 'mapbox://styles/mapbox/streets-v12'
        }
      />
      <IconTooltip />
      {(trips.layersState.isLinesEnabled ||
        trips.layersState.isIconColorEnabled) && <MapCaption />}
      <div className="absolute-x-centered top-2 z-50 w-64">
        <SearchBox />
      </div>
      <MapActions />
    </DeckGL>
  )
}
