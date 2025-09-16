'use client'

import type { LayersList } from '@deck.gl/core'
import { IconLayer } from '@deck.gl/layers'
import type { FeatureCollection, Point } from 'geojson'
import { useEffect, useMemo, useState } from 'react'

import school from '@/assets/school.svg'
import type { School } from '@/models/entities'

export interface UseSchoolLayer {
  data: School[]
  layers: LayersList
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}
export function useSchoolLayer(): UseSchoolLayer {
  const [data, setData] = useState<School[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const fetchCameras = async () => {
      const data: School[] = await fetch(
        'https://raw.githubusercontent.com/prefeitura-rio/storage/master/layers/Escolas_Municipais.geojson',
      ).then((data) =>
        data
          .json()
          .then((data: FeatureCollection<Point, School>) =>
            data.features.map((feature) => feature.properties),
          ),
      )

      setData(data)
    }
    fetchCameras()
  }, [])

  const baseLayer = useMemo(
    () =>
      new IconLayer<School>({
        id: 'schools',
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
    setIsVisible,
    layers: [baseLayer],
  }
}
