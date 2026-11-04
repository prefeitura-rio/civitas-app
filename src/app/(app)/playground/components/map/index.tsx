'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { Feature } from 'geojson'
import mapboxgl from 'mapbox-gl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { config } from '@/config'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

import {
  createPlaygroundDrawStyles,
  PLAYGROUND_DRAW_APPEARANCE,
} from './playground-map-config'
import {
  connectPlaygroundPointClusters,
  setPlaygroundFeatureColor,
} from './playground-point-clusters'

/** Hosts the native Draw editor and clustered point mirror; owns their map lifecycle. */
export function PlaygroundMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)
  const clustersRef = useRef<ReturnType<
    typeof connectPlaygroundPointClusters
  > | null>(null)
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
    null,
  )
  const [selectedColor, setSelectedColor] = useState<string>(
    PLAYGROUND_DRAW_APPEARANCE.defaultColor,
  )
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverCoordinates, setPopoverCoordinates] = useState({ x: 0, y: 0 })

  const handleSelectionChange = useCallback((feature: Feature | null) => {
    setSelectedFeatureId(feature?.id === undefined ? null : String(feature.id))
    setSelectedColor(
      typeof feature?.properties?.color === 'string'
        ? feature.properties.color
        : PLAYGROUND_DRAW_APPEARANCE.defaultColor,
    )
    setPopoverOpen(feature !== null)
  }, [])

  useEffect(() => {
    const container = mapContainer.current
    if (!container) return
    const activeMap = new mapboxgl.Map({
      container,
      accessToken: config.mapboxAccessToken,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [INITIAL_VIEW_PORT.longitude, INITIAL_VIEW_PORT.latitude],
      zoom: INITIAL_VIEW_PORT.zoom,
    })
    let disposed = false
    const handleLoad = () => {
      if (disposed) return
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          point: true,
          line_string: true,
          polygon: true,
          trash: true,
          combine_features: true,
          uncombine_features: true,
        },
        userProperties: true,
        styles: createPlaygroundDrawStyles(),
      })
      activeMap.addControl(draw)
      drawRef.current = draw
      clustersRef.current = connectPlaygroundPointClusters(
        activeMap,
        draw,
        handleSelectionChange,
      )
    }
    const handleClick = (event: mapboxgl.MapMouseEvent) => {
      setPopoverCoordinates({ x: event.point.x, y: event.point.y })
    }
    activeMap.on('load', handleLoad)
    activeMap.on('click', handleClick)
    return () => {
      disposed = true
      activeMap.off('load', handleLoad)
      activeMap.off('click', handleClick)
      clustersRef.current?.dispose()
      clustersRef.current = null
      drawRef.current = null
      activeMap.remove()
    }
  }, [handleSelectionChange])

  /** Updates the Draw property and its clustered mirror without changing feature identity. */
  function updateFeatureColor(color: string) {
    const draw = drawRef.current
    if (!draw || selectedFeatureId === null) return
    if (setPlaygroundFeatureColor(draw, selectedFeatureId, color)) {
      clustersRef.current?.sync()
    }
  }

  return (
    <div className="relative h-screen w-full">
      <div ref={mapContainer} className="h-full w-full" />
      <Card
        data-open={popoverOpen}
        className="absolute w-full max-w-40 p-2 data-[open=false]:hidden"
        style={{
          top: popoverCoordinates.y - 80,
          left: popoverCoordinates.x - 80,
        }}
      >
        <div className="flex items-center space-x-2">
          <Label htmlFor="color-picker">Cor:</Label>
          <Input
            id="color-picker"
            type="color"
            value={selectedColor}
            onChange={(event) => {
              setSelectedColor(event.target.value)
              updateFeatureColor(event.target.value)
            }}
            className="h-8 w-full"
          />
        </div>
      </Card>
    </div>
  )
}
