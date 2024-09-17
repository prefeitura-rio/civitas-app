'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { DeckGL, WebMercatorViewport } from 'deck.gl'
import { useRef } from 'react'
import MapGl, { type MapRef } from 'react-map-gl'

import { useMap } from '@/hooks/use-contexts/use-map-context'

import { MAPBOX_ACCESS_TOKEN } from './components/constants'
import { RadarHoverCard } from './components/radar-hover-card'

export function Map() {
  const {
    layers: {
      radars: {
        layer: radarLayer,
        hoveredObject: hoveredRadar,
        setIsHoveringInfoCard: setIsHoveringRadarInfoCard,
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
  const layers = [radarLayer, ...tripLayers] // TODO: Add other layers

  const getPixelPosition = (longitude: number, latitude: number) => {
    const mercatorViewport = new WebMercatorViewport(viewport)
    const [x, y] = mercatorViewport.project([longitude, latitude])
    return [x, y]
  }

  const hoveredObject = hoveredRadar // Add other hovered objects

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
            if (hoveredRadar) return 'pointer'
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
      {hoveredObject && hoveredObject.object && (
        <RadarHoverCard
          viewport={hoveredObject.viewport}
          setIsHoveringInfoCard={setIsHoveringRadarInfoCard}
          x={
            getPixelPosition(
              hoveredObject.object.longitude,
              hoveredObject.object.latitude,
            )[0]
          }
          y={
            getPixelPosition(
              hoveredObject.object.longitude,
              hoveredObject.object.latitude,
            )[1]
          }
          radar={hoveredObject.object}
        />
      )}
    </div>
  )
}
