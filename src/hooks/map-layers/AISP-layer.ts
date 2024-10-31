'use client'

import type { LayersList, PickingInfo } from '@deck.gl/core'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature, FeatureCollection } from 'geojson'
import { useEffect, useMemo, useState } from 'react'

import type { AISP } from '@/models/entities'

export interface UseAISPLayer {
  features: FeatureCollection
  hoverInfo: PickingInfo<Feature> | null
  setHoverInfo: (info: PickingInfo<Feature> | null) => void
  setIsHoveringInfoCard: (isHovering: boolean) => void
  layers: LayersList
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}
export function useAISPLayer(): UseAISPLayer {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Feature> | null>(null)
  const [features, setFeatures] = useState<FeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  })
  const [isVisible, setIsVisible] = useState(false)
  const [isHoveringInfoCard, setIsHoveringInfoCard] = useState(false)

  useEffect(() => {
    const fetchCameras = async () => {
      const data: FeatureCollection = await fetch(
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
        // autoHighlight: true,
        highlightColor: [7, 76, 128, 250], // CIVITAS-dark-blue
        getFillColor: [160, 160, 180, 200],
        visible: isVisible,
        getLineWidth: 20,
        // getPointRadius: 4,
        // getTextSize: 12,
        onHover: (d) => {
          if (!isHoveringInfoCard) {
            setHoverInfo(d.object ? d : null)
          }
        },
      }),

    [features, isHoveringInfoCard, isVisible],
  )

  return {
    features,
    hoverInfo,
    setHoverInfo,
    setIsHoveringInfoCard,
    isVisible,
    setIsVisible,
    layers: [baseLayer],
  }
}
