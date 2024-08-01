import DeckGL from '@deck.gl/react'
import ReactMapGL from 'react-map-gl'

import { config } from '@/config'
import { useMap } from '@/hooks/use-contexts/use-map-context'

import { IconTooltips } from './components/icon-tooltips'
import { MapActions } from './components/map-actions'
import { MapCaption } from './components/map-caption'
import { SearchBox } from './components/search-box'

export function Map() {
  const {
    layers: {
      camerasCOR,
      radars,
      addressMarker,
      wazePoliceAlerts,
      trips,
      agents,
    },
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
        // trips.layers.lineLayer,
        // trips.layers.lineLayerTransparent,
        camerasCOR.layers.cameraCORLayer,
        radars.layers.radarLayer,
        wazePoliceAlerts.layer,
        camerasCOR.layers.selectedCameraCORLayer,
        radars.layers.selectedRadarLayer,
        radars.layers.slashInactiveRadarsLayer,
        agents.layer,
        // trips.layers.coloredIconLayer,
        trips.layers.blackIconLayer,
        trips.layers.textLayer,
        addressMarker.layer,
      ]}
      onViewStateChange={(e) => setViewport({ ...e.viewState })}
      getCursor={({ isDragging, isHovering }) => {
        if (isDragging) return 'grabbing'
        else if (isHovering) {
          // Actually clickable objects:
          if (
            radars.layerStates.hoverInfo.object ||
            camerasCOR.layerStates.hoverInfo.object
          )
            return 'pointer'
        }
        return 'grab'
      }}
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
      <IconTooltips />
      {(trips.layersState.isLinesEnabled ||
        trips.layersState.isIconColorEnabled) && <MapCaption />}
      <div className="absolute-x-centered top-2 z-50 w-64">
        <SearchBox />
      </div>
      <MapActions />
    </DeckGL>
  )
}
