'use client'
import { IconLayer, type PickingInfo } from 'deck.gl'
import { useState } from 'react'

import radarIconAtlas from '@/assets/radar-icon-atlas.png'
import type { Radar } from '@/models/entities'

import { useRadars } from '../useQueries/useRadars'

export interface UseRadarLayer {
  data: Radar[] | undefined
  layer: IconLayer<Radar>
  hoveredObject: PickingInfo<Radar> | null
  setHoveredObject: (value: PickingInfo<Radar> | null) => void
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  handleSelectObject: (radar: Radar, clearCamera?: () => void) => void
  selectedObject: Radar | null
  setSelectedObject: (radar: Radar | null) => void
}

export function useRadarLayer(): UseRadarLayer {
  const [hoveredObject, setHoveredObject] = useState<PickingInfo<Radar> | null>(
    null,
  )
  const [selectedObject, setSelectedObject] = useState<Radar | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  const { data } = useRadars()

  function handleSelectObject(radar: Radar, clearCamera?: () => void) {
    // Se o radar já está selecionado, deseleciona
    if (selectedObject?.cetRioCode === radar.cetRioCode) {
      setSelectedObject(null)
    } else {
      // Limpa a câmera selecionada se existir
      if (clearCamera) {
        clearCamera()
      }
      // Seleciona apenas o novo radar (substitui o anterior)
      setSelectedObject(radar)
    }
  }

  const layer = new IconLayer<Radar>({
    id: 'radars',
    data,
    pickable: true,
    iconAtlas: radarIconAtlas.src,
    iconMapping: {
      default: {
        x: 0,
        y: 0,
        width: 48,
        height: 48,
        mask: false,
      },
      disabled: {
        x: 0,
        y: 48,
        width: 48,
        height: 48,
        mask: false,
      },
      highlighted: {
        x: 48,
        y: 0,
        width: 48,
        height: 48,
        mask: false,
      },
      'disabled-highlighted': {
        x: 48,
        y: 48,
        width: 48,
        height: 48,
        mask: false,
      },
    },
    getIcon: (d) => {
      if (
        selectedObject?.cetRioCode === d.cetRioCode &&
        d.activeInLast24Hours
      ) {
        return 'highlighted'
      }

      if (
        selectedObject?.cetRioCode === d.cetRioCode &&
        !d.activeInLast24Hours
      ) {
        return 'disabled-highlighted'
      }

      if (!d.activeInLast24Hours) {
        return 'disabled'
      }

      return 'default'
    },
    sizeScale: 24,
    getPosition: (d) => [d.longitude, d.latitude],
    getColor: () => [240, 140, 10],
    visible: isVisible,
    // onHover: (info) => {
    //   if (!isHoveringInfoCard) {
    //     setHoveredObject(info.object ? info : null)
    //   }
    // },
    // onClick: (info) => {
    //   if (info.object) {
    //     handleSelectObject(info.object)
    //   }
    // },
    autoHighlight: true,
    highlightColor: [249, 115, 22],
  })

  return {
    data,
    layer,
    hoveredObject,
    setHoveredObject,
    isVisible,
    setIsVisible,
    handleSelectObject,
    selectedObject,
    setSelectedObject,
  }
}
