import DeckGL from '@deck.gl/react'
import ReactMapGL from 'react-map-gl'

import { config } from '@/config'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'
import { useMapLayers } from '@/hooks/use-contexts/use-map-layers-context'

import { IconTooltip } from './map/icon-tooltip/icon-tooltip'
import { MapActions } from './map/map-actions'
import { MapCaption } from './map/map-caption'
import { SearchBox } from './search-box'

export function Map() {
  const { viewport, setViewport, deckRef, mapRef } = useCarPath()
  const {
    layerHooks: { camerasCOR, radars, addressMarker },
    layers: {
      blackIconLayer,
      coloredIconLayer,
      lineLayer,
      lineLayerTransparent,
      textLayer,
      wazePoliceAlertsLayer,
    },
    mapStates: { isIconColorEnabled, isLinesEnabled, isMapStyleSatellite },
  } = useMapLayers()

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
        lineLayer,
        lineLayerTransparent,
        camerasCOR.layers.cameraCORLayer,
        radars.layers.radarLayer,
        wazePoliceAlertsLayer,
        camerasCOR.layers.selectedCameraCORLayer,
        radars.layers.selectedRadarLayer,
        radars.layers.slashInactiveRadarsLayer,
        coloredIconLayer,
        blackIconLayer,
        textLayer,
        addressMarker.addressMarkerLayer,
      ]}
      onViewStateChange={(e) => setViewport({ ...viewport, ...e.viewState })}
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
      {(isLinesEnabled || isIconColorEnabled) && <MapCaption />}
      <div className="absolute-x-centered top-2 z-50 w-64">
        <SearchBox />
      </div>
      <MapActions />
    </DeckGL>
  )
}
