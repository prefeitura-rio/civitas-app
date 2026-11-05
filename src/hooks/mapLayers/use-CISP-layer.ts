'use client'

import type { LayersList, PickingInfo } from '@deck.gl/core'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { useMemo, useState } from 'react'

import type { CISP } from '@/models/entities'
import { getAispColor } from '@/utils/territory-colors'

import { useReferenceGeoJson } from './use-reference-geojson'

export interface UseCISPLayer {
  features: FeatureCollection<Geometry, CISP>
  hoverInfo: PickingInfo<Feature<Geometry, CISP>> | null
  setHoverInfo: (info: PickingInfo<Feature<Geometry, CISP>> | null) => void
  layers: LayersList
  isVisible: boolean
  isLoading: boolean
  isError: boolean
  setIsVisible: (isVisible: boolean) => void
}
/** Loads CISP boundaries on activation and reuses cached results when available. */
export function useCISPLayer(): UseCISPLayer {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<
    Feature<Geometry, CISP>
  > | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const query = useReferenceGeoJson<Geometry, CISP>(
    'https://raw.githubusercontent.com/prefeitura-rio/storage/master/layers/CISP.geojson',
    isVisible,
  )
  const features = useMemo<FeatureCollection<Geometry, CISP>>(
    () => query.data ?? { type: 'FeatureCollection', features: [] },
    [query.data],
  )

  const baseLayer = useMemo(
    () =>
      new GeoJsonLayer<CISP>({
        id: 'CISP',
        data: features,
        pickable: true,
        stroked: true,
        filled: true,
        pointType: 'icon',
        getFillColor: (d) => getAispColor(d.properties.aisp),
        visible: isVisible,
        getLineWidth: 20,
      }),

    [features, isVisible],
  )

  return {
    features,
    hoverInfo,
    setHoverInfo,
    isVisible,
    isLoading: query.isLoading,
    isError: isVisible && query.isError,
    setIsVisible,
    layers: [baseLayer],
  }
}
