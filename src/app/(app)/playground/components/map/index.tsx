'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { Feature, GeoJsonProperties, Geometry } from 'geojson'
import mapboxgl from 'mapbox-gl'
import React, { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { config } from '@/config'

// Replace with your actual Mapbox access token
mapboxgl.accessToken = config.mapboxAccessToken

export function PlaygroundMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const draw = useRef<MapboxDraw | null>(null)
  const [geoJSON, setGeoJSON] = useState({})
  const [selectedFeature, setSelectedFeature] = useState<Feature<
    Geometry,
    GeoJsonProperties
  > | null>(null)
  const [properties, setProperties] = useState<Record<string, string>>({})
  const [color, setColor] = useState('#3388ff')

  useEffect(() => {
    if (!mapContainer.current) return // Ensure container is available

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 2,
    })

    map.current.on('load', () => {
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          line_string: true,
          trash: true,
        },
        userProperties: true,
      })
      if (map.current) {
        map.current.addControl(draw.current)

        map.current.on('draw.create', createFeature)
        map.current.on('draw.delete', updateGeoJSON)
        map.current.on('draw.update', updateGeoJSON)
        // map.current.on('click', handleMapClick)
        map.current.on('draw.selectionchange', handleSelectionChange)
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [mapContainer.current])

  const handleSelectionChange = (
    e: {
      type: 'draw.selectionchange'
      target: unknown
    } & MapboxDraw.DrawSelectionChangeEvent,
  ) => {
    setSelectedFeature(e.features.at(0) || null)
  }

  const createFeature = (
    e: {
      type: 'draw.create'
      target: unknown
    } & MapboxDraw.DrawCreateEvent,
  ) => {
    const features = e.features.map((f) => ({
      ...f,
      color: '#ff0033',
      properties: {
        ...f.properties,
        color: '#ff0033',
      },
    }))
    if (!draw.current) return
    const data = draw.current.getAll()
    setGeoJSON({
      ...data,
      features,
    })
    updateMapStyle()
  }

  const updateGeoJSON = () => {
    if (!draw.current) return
    const data = draw.current.getAll()
    setGeoJSON(data)
    console.log('update')
    updateMapStyle()
  }

  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProperties((prev) => ({ ...prev, [name]: value }))
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }

  const saveProperties = () => {
    console.log('Saving properties')
    if (!draw.current || !selectedFeature || !selectedFeature.id) return
    console.log('Saving properties')
    draw.current.setFeatureProperty(
      selectedFeature.id.toString(),
      'color',
      color,
    )
    Object.keys(properties).forEach((key) => {
      if (properties[key] !== undefined && draw.current && selectedFeature.id) {
        draw.current.setFeatureProperty(
          selectedFeature.id.toString(),
          key,
          properties[key] as string,
        )
      }
    })
    updateGeoJSON()
  }

  const updateMapStyle = () => {
    if (!selectedFeature?.id) return
    const layerId = 'gl-draw-line-inactive.cold' // Ensure this layer ID exists in your map style
    console.log(layerId)
    const layer = map.current?.getLayer(layerId)
    console.log(layer)
    if (layer) {
      console.log(layer)
      map.current?.setPaintProperty(layerId, 'line-color', [['get', 'color']])
    }
  }

  useEffect(() => {
    console.log('Update map style')
  }, [updateMapStyle])

  return (
    <div className="flex h-screen">
      <div ref={mapContainer} className="h-full w-2/3" />
      <div className="h-full w-1/3 overflow-auto p-4">
        <h2 className="mb-4 text-2xl font-bold">GeoJSON Output</h2>
        <pre className="mb-4 h-1/3 overflow-auto rounded bg-card p-4">
          {JSON.stringify(geoJSON, null, 2)}
        </pre>

        {selectedFeature && (
          <div className="mb-4">
            <h3 className="mb-2 text-xl font-bold">Edit Properties</h3>
            <div className="mb-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={color}
                onChange={handleColorChange}
                className="mt-1"
              />
            </div>
            {Object.keys(properties).map((key) => (
              <div key={key} className="mb-2">
                <Label>{key}</Label>
                <Input
                  type="text"
                  name={key}
                  value={properties[key]}
                  onChange={handlePropertyChange}
                  className="mt-1"
                />
              </div>
            ))}
            <div className="mb-2">
              <Label>New Property</Label>
              <div className="mt-1 flex">
                <Input
                  type="text"
                  placeholder="Key"
                  onBlur={(e) => {
                    if (e.target.value && !properties[e.target.value]) {
                      setProperties((prev) => ({
                        ...prev,
                        [e.target.value]: '',
                      }))
                    }
                  }}
                />
                <Input
                  type="text"
                  placeholder="Value"
                  onBlur={(e) => {
                    const key = (e.target.previousSibling as HTMLInputElement)
                      .value
                    if (key && e.target.value) {
                      setProperties((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  }}
                />
              </div>
            </div>
            <Button onClick={saveProperties} className="mt-2">
              Save Properties
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
