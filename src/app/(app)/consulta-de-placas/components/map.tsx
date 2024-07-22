import DeckGL from '@deck.gl/react'
import ReactMalGL from 'react-map-gl'

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
    layers: {
      blackIconLayer,
      cameraLayer,
      coloredIconLayer,
      lineLayer,
      lineLayerTransparent,
      textLayer,
      addressMarkerLayer,
      radarLayer,
      selectedRadarLayer,
      selectedCameraLayer,
      inactiveRadarLayer,
      wazePoliceAlertsLayer,
    },
    mapStates: {
      cameraHoverInfo,
      isIconColorEnabled,
      isLinesEnabled,
      isMapStyleSatellite,
      isAddressMarkerEnabled,
      setIsAddressMarkerEnabled,
    },
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
        cameraLayer,
        radarLayer,
        wazePoliceAlertsLayer,
        selectedCameraLayer,
        selectedRadarLayer,
        inactiveRadarLayer,
        coloredIconLayer,
        blackIconLayer,
        textLayer,
        addressMarkerLayer,
      ]}
      onViewStateChange={(e) => setViewport({ ...viewport, ...e.viewState })}
      getCursor={({ isDragging }) =>
        isDragging ? 'grabbing' : cameraHoverInfo ? 'pointer' : 'grab'
      }
    >
      <ReactMalGL
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
        <SearchBox
          isAddressmarkerEnabled={isAddressMarkerEnabled}
          setIsAddressmarkerEnabled={setIsAddressMarkerEnabled}
        />
      </div>
      <MapActions />
    </DeckGL>
  )
}
