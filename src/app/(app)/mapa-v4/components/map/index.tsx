'use client'
import 'mapbox-gl/dist/mapbox-gl.css'

import { DeckGL, type MapViewState, WebMercatorViewport } from 'deck.gl'
import { useState } from 'react'
import Map from 'react-map-gl'

import { useRadarLayer } from '@/hooks/map-layers-v3/use-radar-layer'

import { INITIAL_VIEW_STATE, MAPBOX_ACCESS_TOKEN } from './components/constants'
import RadarHoverCard from './components/radar-hover-card'

export default function MapComponent() {
  const [viewport, setViewport] = useState<MapViewState>(INITIAL_VIEW_STATE)

  const {
    layer: radarLayer,
    hoveredObject: hoveredRadar,
    setClickedObject: setClickedRadar,
    setIsHoveringInfoCard,
  } = useRadarLayer()

  const layers = [radarLayer] // TODO: Add other layers

  const getPixelPosition = (longitude: number, latitude: number) => {
    const mercatorViewport = new WebMercatorViewport(viewport)
    const [x, y] = mercatorViewport.project([longitude, latitude])
    return [x, y]
  }

  const hoveredObject = hoveredRadar // TODO: Add other layers

  return (
    <div className="relative h-[calc(100vh-7rem)] w-full overflow-hidden">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        onViewStateChange={({ viewState }) =>
          setViewport(viewState as MapViewState)
        }
        onClick={(info) => {
          if (!info.picked) {
            setClickedRadar(null)
          }
        }}
        getCursor={({ isDragging, isHovering }) => {
          if (isDragging) return 'grabbing'
          else if (isHovering) {
            // Actually clickable objects:
            if (hoveredRadar) return 'pointer'
          }
          return 'grab'
        }}
      >
        <Map
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        />
      </DeckGL>
      {hoveredObject && hoveredObject.object && (
        <RadarHoverCard
          viewport={hoveredObject.viewport}
          setIsHoveringInfoCard={setIsHoveringInfoCard}
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
