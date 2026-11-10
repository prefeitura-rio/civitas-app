'use client'

import type { LayersList } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import type { Point } from 'geojson'
import { useMemo, useState } from 'react'

import busFront from '@/assets/bus-front.svg'
import type { BusStop, RawBusStop } from '@/models/entities'
import { POINT_LAYER_IDS } from '@/utils/point-layer-config'

import { useReferenceGeoJson } from './use-reference-geojson'

export interface UseBusStopLayer {
  data: BusStop[]
  layers: LayersList
  isVisible: boolean
  isLoading: boolean
  isError: boolean
  setIsVisible: (isVisible: boolean) => void
}
/** Loads bus stops on activation, converting GeoJSON coordinates to longitude/latitude fields. */
export function useBusStopLayer(): UseBusStopLayer {
  const [isVisible, setIsVisible] = useState(false)

  const query = useReferenceGeoJson<Point, RawBusStop>(
    'https://raw.githubusercontent.com/prefeitura-rio/storage/master/layers/paradas_onibus.geojson',
    isVisible,
  )
  const data = useMemo(
    () =>
      query.data?.features.map((feature) => ({
        ...feature.properties,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      })) ?? [],
    [query.data],
  )

  const baseLayer = useMemo(
    () =>
      new IconLayer<BusStop>({
        id: POINT_LAYER_IDS.busStops,
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
    isLoading: query.isLoading,
    isError: isVisible && query.isError,
    setIsVisible,
    layers: [baseLayer],
  }
}
