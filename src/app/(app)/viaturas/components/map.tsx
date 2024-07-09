import { GeoJsonLayer } from '@deck.gl/layers'
import { DeckGL } from '@deck.gl/react'
import type { FeatureCollection } from 'geojson'
import { useState } from 'react'
import ReactMalGL from 'react-map-gl'

import { config } from '@/config'
import { useOfficialCars } from '@/hooks/use-contexts/use-official-cars'

import { InfoPopup, type InfoPopupProps } from './info-popup'

export function Map() {
  const { viewport, setViewport, cars } = useOfficialCars()
  const [hoverInfo, setHoverInfo] = useState<InfoPopupProps>(
    {} as InfoPopupProps,
  )

  const carsData = {
    type: 'FeatureCollection',
    features: cars.map((item) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [item.longitude, item.latitude],
        },
        properties: {
          contactInfo: item.contactInfo,
          lastUpdate: item.lastUpdate,
          name: item.name,
          operation: item.operation,
        },
      }
    }),
  } as FeatureCollection

  const carsLayer = new GeoJsonLayer({
    id: 'cars',
    data: carsData,
    pickable: true, // Optional: for interactivity
    stroked: false,
    filled: true,
    pointRadiusMinPixels: 5,
    getFillColor: [7, 76, 128, 250], // Dark blue
    onHover: (info) => {
      console.log({ info })
      setHoverInfo({
        x: info.x,
        y: info.y,
        object: info.object?.properties,
      })
    },
  })

  // console.log(cars)

  return (
    <DeckGL
      initialViewState={viewport}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
      controller
      layers={[carsLayer]}
      onViewStateChange={(e) => setViewport({ ...viewport, ...e.viewState })}
    >
      <ReactMalGL
        mapboxAccessToken={config.mapboxAccessToken}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      />
      <InfoPopup {...hoverInfo} />
    </DeckGL>
  )
}
