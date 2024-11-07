'use client'

import type { LayersList, PickingInfo } from '@deck.gl/core'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { useEffect, useMemo, useState } from 'react'

import type { AISP } from '@/models/entities'

export interface UseAISPLayer {
  features: FeatureCollection<Geometry, AISP>
  hoverInfo: PickingInfo<Feature<Geometry, AISP>> | null
  setHoverInfo: (info: PickingInfo<Feature<Geometry, AISP>> | null) => void
  layers: LayersList
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}
export function useAISPLayer(): UseAISPLayer {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<
    Feature<Geometry, AISP>
  > | null>(null)
  const [features, setFeatures] = useState<FeatureCollection<Geometry, AISP>>({
    type: 'FeatureCollection',
    features: [],
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const fetchCameras = async () => {
      const data: FeatureCollection<Geometry, AISP> = await fetch(
        'https://raw.githubusercontent.com/prefeitura-rio/storage/master/layers/AISP.geojson',
      ).then((data) => data.json())

      setFeatures(data)
    }
    fetchCameras()
  }, [])

  const baseLayer = useMemo(
    () =>
      new GeoJsonLayer<AISP>({
        id: 'AISP',
        data: features,
        pickable: true,
        stroked: true,
        filled: true,
        pointType: 'icon',
        getFillColor: [160, 160, 180, 200],
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
    setIsVisible,
    layers: [baseLayer],
  }
}
