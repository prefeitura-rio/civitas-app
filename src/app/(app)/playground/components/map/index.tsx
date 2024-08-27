import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { type Feature, type GeoJsonProperties, type Geometry } from 'geojson'
import mapboxgl from 'mapbox-gl'
import React, { useEffect, useRef, useState } from 'react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { config } from '@/config'
import { INITIAL_VIEW_PORT } from '@/utils/rio-viewport'

// Define the PlaygroundMap component
export function PlaygroundMap() {
  // useRef for the map container and the map instance
  const mapContainerRef = useRef<HTMLDivElement | null>(null) // Define type for ref
  const mapRef = useRef<mapboxgl.Map | null>(null) // Ref for the map instance
  const draw = useRef<MapboxDraw | null>(null)
  const [pointInfo, setPointInfo] = useState<Feature<
    Geometry,
    GeoJsonProperties
  > | null>(null)

  // Effect to initialize the map and add controls
  useEffect(() => {
    // Set the Mapbox access token
    mapboxgl.accessToken = config.mapboxAccessToken

    // Initialize the map and set it to the ref
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current as HTMLElement, // Ensure type safety
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [INITIAL_VIEW_PORT.longitude, INITIAL_VIEW_PORT.latitude],
      zoom: INITIAL_VIEW_PORT.zoom,
    })

    // Initialize MapboxDraw controls
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      userProperties: true,
      controls: {
        trash: true,
        point: true,
      },
    })

    // Add draw controls to the map
    mapRef.current.addControl(draw.current)

    mapRef.current.on('draw.selectionchange', (e) => {
      if (e.features.length > 0) {
        const point = e.features[0]
        setPointInfo(point)
      } else {
        setPointInfo(null)
      }
    })

    mapRef.current.on('draw.delete', () => setPointInfo(null))

    // Cleanup function to remove event listeners when the component unmounts
    return () => {
      mapRef.current?.off('draw.selectionchange', (e) =>
        console.log({ e_out: e }),
      )
    }
  }, []) // Empty dependency array to run effect only once

  return (
    <div className="relative h-full w-full">
      {/* Map container */}
      <div ref={mapContainerRef} style={{ height: '100%' }} />
      {/* Display the point info when a point is selected */}
      {pointInfo && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardContent className="space-y-1">
                <form></form>
                {/* {Object.entries(pointInfo.properties || {}).map(
                  ([key, value]) => {
                    return (
                      <span className="block">
                        <span className="text-sm font-medium leading-4">
                          {key}
                        </span>
                        : <span className="text-sm leading-4">{value}</span>
                      </span>
                    )
                  },
                )} */}
              </CardContent>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  )
}
