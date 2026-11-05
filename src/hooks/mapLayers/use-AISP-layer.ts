'use client'

import type { LayersList, PickingInfo } from '@deck.gl/core'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { useMemo, useState } from 'react'

import type { AISP } from '@/models/entities'
import { getAispColor } from '@/utils/territory-colors'

import { useReferenceGeoJson } from './use-reference-geojson'

export interface UseAISPLayer {
  features: FeatureCollection<Geometry, AISP>
  hoverInfo: PickingInfo<Feature<Geometry, AISP>> | null
  setHoverInfo: (info: PickingInfo<Feature<Geometry, AISP>> | null) => void
  layers: LayersList
  isVisible: boolean
  isLoading: boolean
  isError: boolean
  setIsVisible: (isVisible: boolean) => void
}
/** Loads AISP boundaries on activation and reuses cached results when available. */
export function useAISPLayer(): UseAISPLayer {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<
    Feature<Geometry, AISP>
  > | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const query = useReferenceGeoJson<Geometry, AISP>(
    'https://raw.githubusercontent.com/prefeitura-rio/storage/master/layers/AISP.geojson',
    isVisible,
  )
  const features = useMemo<FeatureCollection<Geometry, AISP>>(
    () => query.data ?? { type: 'FeatureCollection', features: [] },
    [query.data],
  )

  const baseLayer = useMemo(
    () =>
      new GeoJsonLayer<AISP>({
        id: 'AISP',
        data: features,
        pickable: true,
        stroked: true,
        filled: true,
        pointType: 'icon',
        getFillColor: (d) => getAispColor(d.properties.aisp),
        visible: isVisible,
        getLineWidth: 20,
        getLineColor: [0, 0, 0, 250],
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
