import 'mapbox-gl/dist/mapbox-gl.css'

import { DeckGL, type MapViewState, WebMercatorViewport } from 'deck.gl'
import { useState } from 'react'
import Map from 'react-map-gl'

import { useRadarLayer } from '@/hooks/map-layers-v3/use-radar-layer'

import ClickCard from './components/click-card'
import { INITIAL_VIEW_STATE, MAPBOX_ACCESS_TOKEN } from './components/constants'
import LayerToggle from './components/layer-toggle'
import RadarHoverCard from './components/radar-hover-card'

const initialEnabledLayers = {
  radar: true,
  outra: true,
} as const

export default function MapComponent() {
  const [viewport, setViewport] = useState<MapViewState>(INITIAL_VIEW_STATE)
  const [enabledLayers, setEnabledLayers] = useState(initialEnabledLayers)

  const {
    layer: radarLayer,
    hoveredObject: hoveredRadar,
    clickedObject: clickedRadar,
    setClickedObject: setClickedRadar,
    handleSelectObject: selectRadar,
  } = useRadarLayer()

  const layers = [radarLayer]

  const toggleLayer = (layerId: string) => {
    setEnabledLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId as keyof typeof initialEnabledLayers],
    }))
  }

  const getPixelPosition = (longitude: number, latitude: number) => {
    const mercatorViewport = new WebMercatorViewport(viewport)
    const [x, y] = mercatorViewport.project([longitude, latitude])
    return [x, y]
  }

  const hoveredObject = hoveredRadar
  const clickedObject = clickedRadar

  return (
    <div className="relative h-[calc(100vh-7rem)] w-full">
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
      >
        <Map
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        />
      </DeckGL>
      {clickedObject && clickedObject.object && (
        <div
          style={{
            position: 'absolute',
            zIndex: 1,
            left: getPixelPosition(
              clickedObject.object.longitude,
              clickedObject.object.latitude,
            )[0],
            top: getPixelPosition(
              clickedObject.object.longitude,
              clickedObject.object.latitude,
            )[1],
          }}
        >
          <ClickCard selectRadar={selectRadar} radar={clickedObject.object} />
        </div>
      )}
      {hoveredObject && hoveredObject.object && (
        <RadarHoverCard
          viewport={hoveredObject.viewport}
          x={hoveredObject.x}
          y={hoveredObject.y}
          radar={hoveredObject.object}
        />
      )}

      <LayerToggle
        layers={Object.keys(enabledLayers)}
        enabledLayers={enabledLayers}
        onToggle={toggleLayer}
      />
    </div>
  )
}
