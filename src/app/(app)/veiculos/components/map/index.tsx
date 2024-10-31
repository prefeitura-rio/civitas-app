'use client'

import 'mapbox-gl/dist/mapbox-gl.css'

import { DeckGL } from 'deck.gl'
import { useRef } from 'react'
import MapGl, { type MapRef } from 'react-map-gl'

import { useMap } from '@/hooks/use-contexts/use-map-context'
import { getMapStyle } from '@/utils/get-map-style'

import { MAPBOX_ACCESS_TOKEN } from './components/constants'
import { HoverCards } from './components/hover-cards'
import { MapLayerControl } from './components/layer-toggle'
import { SearchBox } from './components/search-box'

export function Map() {
  const {
    layers: {
      radars: { layer: radarLayer, hoveredObject: hoveredRadar, data: radars },
      cameras: {
        layer: cameraLayer,
        hoveredObject: hoveredCamera,
        data: cameras,
      },
      agents: { layer: agentsLayer },
      fogoCruzado: { layer: fogoCruzadoLayer },
      waze: { layer: wazeLayer },
      trips: { layers: tripLayers },
      address: {
        layerStates: {
          isVisible: isAddressVisible,
          setIsVisible: setIsAddressVisible,
          setAddressMarker,
        },
        layer: addressLayer,
      },
      AISP: { layers: AISPLayer },
      CISP: { layers: CISPLayer },
    },
    viewport,
    setViewport,
    mapStyle,
  } = useMap()

  const mapRef = useRef<MapRef | null>(null)

  // Add other layers
  const layers = [
    ...AISPLayer,
    ...CISPLayer,
    cameraLayer,
    radarLayer,
    wazeLayer,
    fogoCruzadoLayer,
    agentsLayer,
    ...tripLayers,
    addressLayer,
  ]

  return (
    <div className="relative h-full w-full overflow-hidden">
      <DeckGL
        initialViewState={viewport}
        controller
        onResize={() => mapRef?.current?.resize()}
        layers={layers}
        onViewStateChange={(e) => setViewport({ ...e.viewState })}
        getCursor={({ isDragging, isHovering }) => {
          if (isDragging) return 'grabbing'
          else if (isHovering) {
            // Actually clickable objects:
            if (hoveredRadar || hoveredCamera) return 'pointer'
          }
          return 'grab'
        }}
      >
        <MapGl
          ref={mapRef}
          mapStyle={getMapStyle(mapStyle)}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        />
      </DeckGL>
      <div className="absolute-x-centered top-2 z-50 w-64">
        <SearchBox
          isVisible={isAddressVisible}
          setIsVisible={setIsAddressVisible}
          setAddressMarker={setAddressMarker}
          setViewport={setViewport}
          onSubmit={(props) => {
            const id = props.address
            const radar = radars?.find((r) => {
              const trimmedCameraNumber = r.cameraNumber.replace(/^0+/, '')
              const trimmedCetRioCode = r.cetRioCode?.replace(/^0+/, '')
              const trimmedId = id.replace(/^0+/, '')
              return (
                trimmedCameraNumber === trimmedId ||
                trimmedCetRioCode === trimmedId
              )
            })
            if (radar) {
              setViewport({
                latitude: radar.latitude,
                longitude: radar.longitude,
                zoom: 20,
              })
              return
            }
            const camera = cameras?.find((c) => {
              const trimmedCode = c.code.replace(/^0+/, '')
              const trimmedId = id.replace(/^0+/, '')
              return trimmedCode === trimmedId
            })
            if (camera) {
              setViewport({
                latitude: camera.latitude,
                longitude: camera.longitude,
                zoom: 20,
              })
            }
          }}
        />
      </div>
      <HoverCards />
      <MapLayerControl />
    </div>
  )
}
