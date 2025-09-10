'use client'
import { IconLayer, type PickingInfo } from 'deck.gl'
import { useCallback, useMemo, useState } from 'react'

import radarIconAtlas from '@/assets/radar-icon-atlas.png'
import type { Radar } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'

import { useRadars } from '../useQueries/useRadars'

export interface UseRadarLayer {
  data: Radar[] | undefined
  layer: IconLayer<Radar>
  hoveredObject: PickingInfo<Radar> | null
  setHoveredObject: (value: PickingInfo<Radar> | null) => void
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  handleSelectObject: (radar: Radar, clearCamera?: () => void) => void
  handleMultiSelectObject: (radar: Radar) => void
  selectedObject: Radar | null
  setSelectedObject: (radar: Radar | null) => void
  selectedObjects: Radar[]
  setSelectedObjects: (radars: Radar[] | ((prev: Radar[]) => Radar[])) => void
  multipleSelectedRadars?: string[]
}

export function useRadarLayer(
  multipleSelectedRadars: string[] = [],
): UseRadarLayer {
  const [hoveredObject, setHoveredObject] = useState<PickingInfo<Radar> | null>(
    null,
  )
  const [selectedObject, setSelectedObject] = useState<Radar | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  const { data } = useRadars()

  // Usar o estado global do Zustand para seleção múltipla
  const setMultipleSelectedRadars = useMapStore(
    (state) => state.setMultipleSelectedRadars,
  )

  // Calcular selectedObjects baseado nos códigos selecionados
  const selectedObjects = useMemo(() => {
    if (!data || !multipleSelectedRadars.length) return []
    return data.filter((radar) =>
      multipleSelectedRadars.includes(radar.cetRioCode),
    )
  }, [data, multipleSelectedRadars])

  // Função para atualizar selectedObjects via Zustand
  const setSelectedObjects = useCallback(
    (radarsOrUpdater: Radar[] | ((prev: Radar[]) => Radar[])) => {
      const newRadars =
        typeof radarsOrUpdater === 'function'
          ? radarsOrUpdater(selectedObjects)
          : radarsOrUpdater
      const newCodes = newRadars.map((radar) => radar.cetRioCode)
      setMultipleSelectedRadars(newCodes)
    },
    [selectedObjects, setMultipleSelectedRadars],
  )

  const handleSelectObject = useCallback(
    (radar: Radar, clearCamera?: () => void) => {
      console.log('🎯 useRadarLayer - handleSelectObject called', {
        radarCode: radar.cetRioCode,
        currentSelected: selectedObject?.cetRioCode,
        willDeselect: selectedObject?.cetRioCode === radar.cetRioCode,
      })

      // APENAS seleção individual (para clique direito + popup)
      if (selectedObject?.cetRioCode === radar.cetRioCode) {
        console.log('🚫 useRadarLayer - Deselecting radar', radar.cetRioCode)
        setSelectedObject(null)
      } else {
        console.log('✅ useRadarLayer - Selecting radar', radar.cetRioCode)
        if (clearCamera) {
          clearCamera()
        }
        setSelectedObject(radar)
      }
    },
    [selectedObject?.cetRioCode, setSelectedObject],
  )

  const handleMultiSelectObject = useCallback(
    (radar: Radar) => {
      console.log('🎯 useRadarLayer - handleMultiSelectObject called', {
        radarCode: radar.cetRioCode,
        currentSelectedCount: selectedObjects.length,
        currentSelectedIds: selectedObjects.map((r) => r.cetRioCode),
        isAlreadySelected: !!selectedObjects.find(
          (item) => item.cetRioCode === radar.cetRioCode,
        ),
      })

      // APENAS seleção múltipla (para clique esquerdo + input)
      // ❗ IMPORTANTE: Usar função de atualização para obter o estado mais recente
      setMultipleSelectedRadars((currentCodes) => {
        const radarCode = radar.cetRioCode

        if (currentCodes.includes(radarCode)) {
          console.log('🚫 useRadarLayer - Removing from multi-selection', {
            radarCode,
            beforeCount: currentCodes.length,
          })
          const newCodes = currentCodes.filter((code) => code !== radarCode)
          console.log('🚫 useRadarLayer - After removal', {
            afterCount: newCodes.length,
            afterCodes: newCodes,
          })
          return newCodes
        } else {
          console.log('✅ useRadarLayer - Adding to multi-selection', {
            radarCode,
            beforeCount: currentCodes.length,
          })
          const newCodes = [radarCode, ...currentCodes]
          console.log('✅ useRadarLayer - After addition', {
            afterCount: newCodes.length,
            afterCodes: newCodes,
          })
          return newCodes
        }
      })
    },
    [setMultipleSelectedRadars, selectedObjects],
  )

  const layer = useMemo(
    () =>
      new IconLayer<Radar>({
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
          const isSelected = selectedObject?.cetRioCode === d.cetRioCode
          const isMultiSelected = selectedObjects.find(
            (item) => item.cetRioCode === d.cetRioCode,
          )

          if ((isSelected || isMultiSelected) && d.activeInLast24Hours) {
            return 'highlighted'
          }

          if ((isSelected || isMultiSelected) && !d.activeInLast24Hours) {
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
      }),
    [
      data,
      selectedObject?.cetRioCode,
      selectedObjects,
      isVisible,
      multipleSelectedRadars,
    ],
  )

  return {
    data,
    layer,
    hoveredObject,
    setHoveredObject,
    isVisible,
    setIsVisible,
    handleSelectObject,
    handleMultiSelectObject,
    selectedObject,
    setSelectedObject,
    selectedObjects,
    setSelectedObjects,
    multipleSelectedRadars,
  }
}
