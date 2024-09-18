'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { DeckGL } from 'deck.gl'
import {
  Cctv,
  FlameKindling,
  Satellite,
  Siren,
  UsersRound,
  Video,
} from 'lucide-react'
import { useRef } from 'react'
import MapGl, { type MapRef } from 'react-map-gl'

import { useMap } from '@/hooks/use-contexts/use-map-context'

import { MAPBOX_ACCESS_TOKEN } from './components/constants'
import { CameraHoverCard } from './components/hover-cards/camera-hover-card'
import { RadarHoverCard } from './components/hover-cards/radar-hover-card'
import { MapLayerControl } from './components/layer-toggle'
import { CameraSelectCard } from './components/select-cards/camera-select-card'

export function Map() {
  const {
    layers: {
      radars: {
        layer: radarLayer,
        hoveredObject: hoveredRadar,
        setIsHoveringInfoCard: setIsHoveringRadarInfoCard,
        isVisible: isRadarVisible,
        setIsVisible: setIsRadarVisible,
      },
      cameras: {
        layer: cameraLayer,
        isVisible: isCameraVisible,
        setIsVisible: setIsCameraVisible,
        hoveredObject: hoveredCamera,
        selectedObject: selectedCamera,
        setSelectedObject: setSelectedCamera,
      },
      trips: {
        layers: tripLayers,
        // hoveredObject: hoveredTrip,
        // setIsHoveringInfoCard: setIsHoveringTripInfoCard,
      },
    },
    viewport,
    setViewport,
  } = useMap()

  const mapRef = useRef<MapRef | null>(null)

  // Add other layers
  const layers = [cameraLayer, radarLayer, ...tripLayers]

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
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        />
      </DeckGL>
      {hoveredRadar && hoveredRadar.object && (
        <RadarHoverCard
          setIsHoveringInfoCard={setIsHoveringRadarInfoCard}
          hoveredObject={hoveredRadar}
        />
      )}
      {hoveredCamera && (
        <CameraHoverCard
          hoveredObject={hoveredCamera}
          setIsHoveringInfoCard={setIsHoveringRadarInfoCard}
        />
      )}
      {selectedCamera && (
        <CameraSelectCard
          setSelectedObject={setSelectedCamera}
          selectedObject={selectedCamera}
        />
      )}
      <MapLayerControl
        layers={[
          {
            name: 'Radar',
            icon: <Cctv />,
            isVisible: isRadarVisible,
            setIsVisible: setIsRadarVisible,
          },
          {
            name: 'Câmeras',
            icon: <Video />,
            isVisible: isCameraVisible,
            setIsVisible: setIsCameraVisible,
          },
          {
            name: 'Agentes',
            icon: <UsersRound />,
            isVisible: isRadarVisible,
            setIsVisible: setIsRadarVisible,
          },
          {
            name: 'Policiamento (Waze)',
            icon: <Siren />,
            isVisible: isRadarVisible,
            setIsVisible: setIsRadarVisible,
          },
          {
            name: 'Fogo Cruzado',
            icon: <FlameKindling />,
            isVisible: isRadarVisible,
            setIsVisible: setIsRadarVisible,
          },
          {
            name: 'Satélite',
            icon: <Satellite />,
            isVisible: isRadarVisible,
            setIsVisible: setIsRadarVisible,
          },
        ]}
      />
    </div>
  )
}
