'use client'

import type { LayersList } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import type { Point } from 'geojson'
import { useMemo, useState } from 'react'

import school from '@/assets/school.svg'
import type { School } from '@/models/entities'
import { POINT_LAYER_IDS } from '@/utils/point-layer-config'

import { useReferenceGeoJson } from './use-reference-geojson'

export interface UseSchoolLayer {
  data: School[]
  layers: LayersList
  isVisible: boolean
  isLoading: boolean
  isError: boolean
  setIsVisible: (isVisible: boolean) => void
}
/** Loads municipal schools on activation and reuses cached results when available. */
export function useSchoolLayer(): UseSchoolLayer {
  const [isVisible, setIsVisible] = useState(false)

  const query = useReferenceGeoJson<Point, School>(
    'https://raw.githubusercontent.com/prefeitura-rio/storage/master/layers/Escolas_Municipais.geojson',
    isVisible,
  )
  const data = useMemo(
    () => query.data?.features.map((feature) => feature.properties) ?? [],
    [query.data],
  )

  const baseLayer = useMemo(
    () =>
      new IconLayer<School>({
        id: POINT_LAYER_IDS.schools,
        data,
        pickable: true,
        getSize: 24,
        autoHighlight: true,
        highlightColor: [0, 126, 159, 250],
        visible: isVisible,
        getIcon: () => ({
          url: school.src,
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
