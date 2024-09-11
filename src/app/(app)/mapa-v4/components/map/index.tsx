import 'mapbox-gl/dist/mapbox-gl.css'

import { DeckGL, WebMercatorViewport } from 'deck.gl'
import { useCallback, useState } from 'react'
import Map from 'react-map-gl'

import { useRadarLayer } from '@/hooks/map-layers-v3/use-radar-layer'

import { INITIAL_VIEW_STATE, MAPBOX_ACCESS_TOKEN } from './components/constants'
import HoverCard from './components/hover-card'
import LayerToggle from './components/layer-toggle'

const initialEnabledLayers = {
  radar: true,
  outra: true,
} as const

export default function MapComponent() {
  const [viewport, setViewport] = useState(INITIAL_VIEW_STATE)
  const [enabledLayers, setEnabledLayers] = useState(initialEnabledLayers)

  const {
    layer: radarLayer,
    hoveredObject: hoveredRadar,
    clickedObject: clickedRadar,
  } = useRadarLayer()

  const layers = [radarLayer]

  const toggleLayer = (layerId: string) => {
    setEnabledLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId as keyof typeof initialEnabledLayers],
    }))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onViewStateChange = useCallback(({ viewState }: any) => {
    setViewport(viewState)
  }, [])

  const getPixelPosition = useCallback(
    (longitude: number, latitude: number) => {
      const mercatorViewport = new WebMercatorViewport(viewport)
      const [x, y] = mercatorViewport.project([longitude, latitude])
      return [x, y]
    },
    [viewport],
  )

  const hoveredObject = hoveredRadar
  const clickedObject = clickedRadar

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        onViewStateChange={onViewStateChange}
      >
        <Map
          mapStyle="mapbox://styles/mapbox/dark-v10"
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        />
      </DeckGL>
      {hoveredObject && !clickedObject && (
        <div
          style={{
            position: 'absolute',
            zIndex: 1,
            pointerEvents: 'none',
            left: hoveredObject.x,
            top: hoveredObject.y,
          }}
        >
          {hoveredObject.object && <HoverCard {...hoveredObject.object} />}
        </div>
      )}
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
          <HoverCard {...clickedObject.object} />
        </div>
      )}
      <LayerToggle
        layers={Object.keys(enabledLayers)}
        enabledLayers={enabledLayers}
        onToggle={toggleLayer}
      />
    </div>
  )
}
