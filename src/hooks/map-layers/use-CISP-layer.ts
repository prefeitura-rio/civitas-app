'use client'

import type { LayersList, PickingInfo } from '@deck.gl/core'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { useEffect, useMemo, useState } from 'react'

import type { CISP } from '@/models/entities'

export interface UseCISPLayer {
  features: FeatureCollection<Geometry, CISP>
  hoverInfo: PickingInfo<Feature<Geometry, CISP>> | null
  setHoverInfo: (info: PickingInfo<Feature<Geometry, CISP>> | null) => void
  layers: LayersList
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}
export function useCISPLayer(): UseCISPLayer {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<
    Feature<Geometry, CISP>
  > | null>(null)
  const [features, setFeatures] = useState<FeatureCollection<Geometry, CISP>>({
    type: 'FeatureCollection',
    features: [],
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const fetchCameras = async () => {
      const data: FeatureCollection<Geometry, CISP> = await fetch(
        'https://raw.githubusercontent.com/prefeitura-rio/storage/master/layers/CISP.geojson',
      ).then((data) => data.json())

      setFeatures(data)
    }
    fetchCameras()
  }, [])

  const baseLayer = useMemo(
    () =>
      new GeoJsonLayer<CISP>({
        id: 'CISP',
        data: features,
        pickable: true,
        stroked: true,
        filled: true,
        pointType: 'icon',
        getFillColor: [160, 160, 180, 200],
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
    setIsVisible,
    layers: [baseLayer],
  }
}
