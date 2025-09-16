'use client'

import type { LayersList } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import type { FeatureCollection, Point } from 'geojson'
import { useEffect, useMemo, useState } from 'react'

import busFront from '@/assets/bus-front.svg'
import type { BusStop, RawBusStop } from '@/models/entities'

export interface UseBusStopLayer {
  data: BusStop[]
  layers: LayersList
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}
export function useBusStopLayer(): UseBusStopLayer {
  const [data, setData] = useState<BusStop[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const fetchCameras = async () => {
      const data: BusStop[] = await fetch(
        'https://raw.githubusercontent.com/prefeitura-rio/storage/master/layers/paradas_onibus.geojson',
      ).then((data) =>
        data.json().then((data: FeatureCollection<Point, RawBusStop>) =>
          data.features.map((feature) => ({
            ...feature.properties,
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
          })),
        ),
      )

      setData(data)
    }
    fetchCameras()
  }, [])

  const baseLayer = useMemo(
    () =>
      new IconLayer<BusStop>({
        id: 'BusStops',
        data,
        getSize: 24,
        visible: isVisible,
        getIcon: () => ({
          url: busFront.src,
          width: 48,
          height: 48,
          mask: false,
        }),
        getPosition: (info) => [info.longitude, info.latitude],
      }),

    [data, isVisible],
  )

  return {
    data,
    isVisible,
    setIsVisible,
    layers: [baseLayer],
  }
}
