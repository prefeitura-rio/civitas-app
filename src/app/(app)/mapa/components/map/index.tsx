import DeckGL from '@deck.gl/react'
import ReactMapGL from 'react-map-gl'
import { toast } from 'sonner'

import { config } from '@/config'
import { useMap } from '@/hooks/use-contexts/use-map-context'

import { HoverComponents } from './components/hover-components'
import { MapActions } from './components/map-actions'
import { MapCaption } from './components/map-caption'
import { SearchBox } from './components/search-box'
import { SelectionComponents } from './components/selection-components'

export function Map() {
  const {
    layers: {
      camerasCOR,
      radars,
      addressMarker,
      wazePoliceAlerts,
      trips,
      agents,
      fogoCruzadoIncidents,
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
      onResize={() => mapRef?.current?.resize()}
      controller
      layers={[
        camerasCOR.layers.cameraCORLayer,
        radars.layers.radarLayer,
        wazePoliceAlerts.layer,
        camerasCOR.layers.selectedCameraCORLayer,
        radars.layers.selectedRadarLayer,
        radars.layers.slashInactiveRadarsLayer,
        agents.layer,
        trips.layers.blackIconLayer,
        trips.layers.textLayer,
        addressMarker.layer,
        fogoCruzadoIncidents.layer,
      ]}
      onViewStateChange={(e) => setViewport({ ...e.viewState })}
      getCursor={({ isDragging, isHovering }) => {
        if (isDragging) return 'grabbing'
        else if (isHovering) {
          // Actually clickable objects:
          if (
            radars.layerStates.hoverInfo.object ||
            camerasCOR.layerStates.hoverInfo.object ||
            fogoCruzadoIncidents.layerStates.hoverInfo.object
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
      <HoverComponents />
      <SelectionComponents />
      {(trips.layersState.isLinesEnabled ||
        trips.layersState.isIconColorEnabled) && <MapCaption />}
      <div className="absolute-x-centered top-2 z-50 w-64">
        <SearchBox
          isVisible={addressMarker.layerStates.isVisible}
          setIsVisible={addressMarker.layerStates.setIsVisible}
          setAddressMarker={addressMarker.layerStates.setAddressMarker}
          setViewport={setViewport}
          placeHolder="Pesquise um endereço, câmera ou radar"
          onSubmit={(props) => {
            if (props.address.length === 6) {
              const cameraCode = props.address
              const camera = camerasCOR.data.find(
                (item) => item.code === cameraCode,
              )
              if (camera) {
                camerasCOR.layerStates.setIsVisible(true)
                camerasCOR.layerStates.setSelectedCameraCOR(camera)
                setViewport({
                  latitude: camera.latitude,
                  longitude: camera.longitude,
                  zoom: 20,
                })
              } else {
                toast.warning('Nenhuma câmera com esse código foi encontrada.')
              }
            } else if (props.address.length > 6) {
              const radarCode = props.address
              const radar = radars.data.find(
                (item) =>
                  item.cameraNumber === radarCode ||
                  item.cetRioCode === radarCode,
              )
              if (radar) {
                radars.layerStates.setIsVisible(true)
                radars.layerStates.setSelectedRadar(radar)
                setViewport({
                  latitude: radar.latitude,
                  longitude: radar.longitude,
                  zoom: 20,
                })
              } else {
                toast.warning('Nenhum radar com esse código foi encontrada.')
              }
            }
          }}
        />
      </div>
      <MapActions />
    </DeckGL>
  )
}
