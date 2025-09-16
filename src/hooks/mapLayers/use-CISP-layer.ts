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
        getFillColor: (d) => {
          switch (d.properties.aisp) {
            case 27:
              return [173, 216, 230, 200] // Azul Claro
            case 40:
              return [152, 251, 152, 200] // Verde Menta
            case 31:
              return [255, 250, 150, 200] // Amarelo Vivo
            case 14:
              return [255, 165, 90, 200] // Salmão Laranja
            case 18:
              return [230, 230, 250, 200] // Lavanda
            case 41:
              return [255, 209, 220, 200] // Rosa Pálido
            case 9:
              return [211, 211, 211, 200] // Cinza Claro
            case 3:
              return [240, 230, 190, 200] // Bege Amarelado
            case 6:
              return [64, 224, 208, 200] // Turquesa
            case 16:
              return [255, 200, 150, 200] // Pêssego

            case 17:
              return [95, 158, 160, 200] // Azul Petróleo Suave
            case 22:
              return [144, 238, 144, 200] // Verde Claro
            case 4:
              return [216, 191, 216, 200] // Lilás Suave
            case 5:
              return [255, 215, 100, 200] // Dourado Brilhante
            case 2:
              return [240, 128, 128, 200] // Coral Suave
            case 19:
              return [175, 238, 238, 200] // Verde Água
            case 23:
              return [255, 240, 210, 200] // Creme
            case 1:
              return [176, 196, 222, 200] // Cinza Azulado
            case 7:
              return [150, 190, 210, 200] // Azul Gelo

            default:
              return [47, 47, 47, 200] // Cor padrão (cinza escuro)
          }
        },
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
