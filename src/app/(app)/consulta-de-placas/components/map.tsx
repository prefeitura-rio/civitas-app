import DeckGL from '@deck.gl/react'
import ReactMalGL from 'react-map-gl'

import { config } from '@/config'
import { useCarsPathMapLayers } from '@/hooks/use-cars-path-map-layers'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'

import { CameraInfoPopupCard } from './camera-info-popup'
import { IconTooltipCard } from './map/icon-tooltip-card'
import { LineTooltipCard } from './map/line-tooltip-card'
import { MapActions } from './map/map-actions'
import { MapCaption } from './map/map-caption'
import { SearchBox } from './map/search-box'
import { CameraFullInfoPopup } from './side-pannel/camera-full-info-popup'

export function Map() {
  const {
    viewport,
    setViewport,
    setHightlightedObject,
    hightlightedObject,
    deckRef,
    mapRef,
  } = useCarPath()
  const {
    layers: {
      blackIconLayer,
      cameraLayer,
      coloredIconLayer,
      lineLayer,
      lineLayerTransparent,
      textLayer,
      addressMarkerLayer,
    },
    mapStates: {
      cameraHoverInfo,
      iconHoverInfo,
      isCamerasEnabled,
      isIconColorEnabled,
      isLinesEnabled,
      isMapStyleSatellite,
      lineHoverInfo,
      setIsCamerasEnabled,
      setIsIconColorEnabled,
      setIsLinesEnabled,
      setIsMapStyleSatellite,
      isAddressMarkerEnabled,
      setIsAddressMarkerEnabled,
    },
  } = useCarsPathMapLayers()

  return (
    <DeckGL
      ref={deckRef}
      initialViewState={viewport}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
      controller
      layers={[
        isLinesEnabled && lineLayer,
        isLinesEnabled && lineLayerTransparent,
        isCamerasEnabled && cameraLayer,
        isIconColorEnabled ? coloredIconLayer : blackIconLayer,
        textLayer,
        isAddressMarkerEnabled && addressMarkerLayer,
      ]}
      onViewStateChange={(e) => setViewport({ ...viewport, ...e.viewState })}
      onHover={({ object }) => {
        if (object?.properties?.streamingUrl) {
          setHightlightedObject(object)
        }
      }}
      getCursor={({ isDragging }) =>
        isDragging ? 'grabbing' : hightlightedObject ? 'pointer' : 'grab'
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
      <IconTooltipCard {...iconHoverInfo} />
      <LineTooltipCard {...lineHoverInfo} />
      <CameraInfoPopupCard {...cameraHoverInfo} />
      <CameraFullInfoPopup />
      {(isLinesEnabled || isIconColorEnabled) && <MapCaption />}
      <SearchBox
        isAddressmarkerEnabled={isAddressMarkerEnabled}
        setIsAddressmarkerEnabled={setIsAddressMarkerEnabled}
      />
      <MapActions
        isMapStyleSatellite={isMapStyleSatellite}
        setIsMapStyleSatellite={setIsMapStyleSatellite}
        isLinesEnabled={isLinesEnabled}
        setIsLinesEnabled={setIsLinesEnabled}
        isIconColorEnabled={isIconColorEnabled}
        setIsIconColorEnabled={setIsIconColorEnabled}
        isCamerasEnabled={isCamerasEnabled}
        setIsCamerasEnabled={setIsCamerasEnabled}
      />
    </DeckGL>
  )
}
