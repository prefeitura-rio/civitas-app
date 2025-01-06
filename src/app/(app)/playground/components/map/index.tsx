'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

import MapboxDraw from '@mapbox/mapbox-gl-draw'
import mapboxgl from 'mapbox-gl'
import React, { useEffect, useRef, useState } from 'react'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

export function PlaygroundMap({
  mapboxAccessToken,
}: {
  mapboxAccessToken: string
}) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
    null,
  )
  const [selectedColor, setSelectedColor] = useState('#3bb2d0')
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverCoordinates, setPopoverCoordinates] = useState({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    if (map.current) return // initialize map only once

    mapboxgl.accessToken = mapboxAccessToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [INITIAL_VIEW_PORT.longitude, INITIAL_VIEW_PORT.latitude],
      zoom: INITIAL_VIEW_PORT.zoom,
    })

    map.current.on('load', () => {
      drawRef.current = new MapboxDraw({
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
      })
      if (map.current) {
        map.current.addControl(drawRef.current)
        map.current.on('draw.selectionchange', handleSelectionChange)
        map.current.on('draw.delete', () => setPopoverOpen(false))
        map.current.on('click', (e) =>
          setPopoverCoordinates({
            x: e.point.x,
            y: e.point.y,
          }),
        )
      }
    })
  }, [])

  const handleSelectionChange = (e: {
    features: mapboxgl.MapboxGeoJSONFeature[]
  }) => {
    if (e.features.length > 0) {
      const feature = e.features[0]
      setSelectedFeatureId(feature.id?.toString() || null)
      setSelectedColor(feature.properties?.color || '#3bb2d0')
      setPopoverOpen(true)
    } else {
      setSelectedFeatureId(null)
      setSelectedColor('#3bb2d0')
      setPopoverOpen(false)
    }
  }

  const updateFeatureColor = (color: string) => {
    if (!drawRef.current || !selectedFeatureId) return

    const feature = drawRef.current.get(selectedFeatureId)
    if (feature) {
      if (!feature.properties) {
        feature.properties = {}
      }
      feature.properties.color = color
      drawRef.current.add(feature)
      updateDrawColors()
    }
  }

  const updateDrawColors = () => {
    if (!drawRef.current || !map.current) return

    const features = drawRef.current.getAll().features
    const filters = features.flatMap((feature) => {
      const featureId = feature.id as string
      const color = feature?.properties?.color || '#3bb2d0'
      return [['==', ['get', 'id'], featureId], color]
    })

    const featureTypes = [
      'gl-draw-polygon-stroke',
      'gl-draw-polygon-fill',
      'gl-draw-line',
      'gl-draw-point',
    ]

    // Update colors for each feature type
    featureTypes.forEach((prefix: string) => {
      const variants = ['cold', 'hot']

      variants.forEach((state) => {
        const layerId = `${prefix}-inactive.${state}`

        if (map.current?.getLayer(layerId)) {
          map.current.setPaintProperty(
            layerId,
            `${prefix === 'gl-draw-point' ? 'circle' : prefix === 'gl-draw-line' || prefix === 'gl-draw-polygon-stroke' ? 'line' : 'fill'}-color`,
            [
              'case',
              ...filters,
              '#3bb2d0', // default color
            ],
          )

          // // Additional styling for point size and outline
          // if (prefix === 'gl-draw-point') {
          //   map.current.setPaintProperty(
          //     layerId,
          //     'circle-radius',
          //     4, // Increase the size of points
          //   )
          //   map.current.setPaintProperty(
          //     layerId,
          //     'circle-stroke-width',
          //     3, // Add an outline to the points
          //   )
          //   map.current.setPaintProperty(
          //     layerId,
          //     'circle-stroke-color',
          //     '#FFF', // Outline color
          //   )
          // }
        }
      })
    })
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
            onChange={(e) => {
              const newColor = e.target.value
              setSelectedColor(newColor)
              updateFeatureColor(newColor)
            }}
            className="h-8 w-full"
          />
        </div>
      </Card>
    </div>
  )
}
