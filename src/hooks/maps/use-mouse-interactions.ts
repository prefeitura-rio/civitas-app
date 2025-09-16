'use client'

import { type Deck, type PickingInfo } from 'deck.gl'
import { type MouseEvent, useCallback, useRef } from 'react'

import type { CameraCOR, Radar } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'

interface UseMouseInteractionsProps {
  deckRef: React.RefObject<Deck | null>
  multiSelectRadar: (radar: Radar) => void
  selectCamera: (camera: CameraCOR | null, clearRadar?: () => void) => void
  setSelectedRadar: (radar: Radar | null) => void
  setSelectedCamera: (camera: CameraCOR | null) => void
  setContextMenuPickingInfo: (info: PickingInfo | null) => void
  setOpenContextMenu: (open: boolean) => void
  zoomToLocation: (lat: number, lng: number, zoom: number) => void
}

export function useMouseInteractions({
  deckRef,
  multiSelectRadar,
  selectCamera,
  setSelectedRadar,
  setSelectedCamera,
  setContextMenuPickingInfo,
  setOpenContextMenu,
  zoomToLocation,
}: UseMouseInteractionsProps) {
  const mouseDownPosition = useRef<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)

  const handleRightClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const y = e.clientY
      const x = e.clientX - 56
      const info = deckRef.current?.pickObject({ x, y, radius: 0 })
      const ZOOM_SIZE = 18

      if (info?.layer?.id === 'radars' && info.object) {
        const radar = info.object as Radar
        const setRadarInfoMode = useMapStore.getState().setRadarInfoMode
        setRadarInfoMode(radar)
        setSelectedCamera(null)
        zoomToLocation(radar.latitude, radar.longitude, ZOOM_SIZE)
        return
      }

      if (info?.layer?.id === 'cameras' && info.object) {
        const camera = info.object as CameraCOR
        selectCamera(camera, () => {
          setSelectedRadar(null)
          const setRadarInfoMode = useMapStore.getState().setRadarInfoMode
          setRadarInfoMode(null)
        })
        zoomToLocation(camera.latitude, camera.longitude, ZOOM_SIZE)
        return
      }

      setContextMenuPickingInfo(info || null)
      setOpenContextMenu(!!info)
    },
    [
      deckRef,
      setContextMenuPickingInfo,
      setOpenContextMenu,
      selectCamera,
      setSelectedRadar,
      setSelectedCamera,
      zoomToLocation,
    ],
  )

  const handleMouseDown = useCallback((e: MouseEvent) => {
    mouseDownPosition.current = { x: e.clientX, y: e.clientY }
    isDragging.current = false
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (mouseDownPosition.current) {
      const deltaX = Math.abs(e.clientX - mouseDownPosition.current.x)
      const deltaY = Math.abs(e.clientY - mouseDownPosition.current.y)

      if (deltaX > 10 || deltaY > 10) {
        isDragging.current = true
      }
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    mouseDownPosition.current = null
  }, [])

  const handleLeftClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()

      if (isDragging.current) {
        isDragging.current = false
        mouseDownPosition.current = null
        return
      }

      const y = e.clientY
      const x = e.clientX - 56
      const info = deckRef.current?.pickObject({ x, y, radius: 0 })

      if (info?.layer?.id === 'radars' && info.object) {
        const radar = info.object as Radar
        multiSelectRadar(radar)
      }

      isDragging.current = false
      mouseDownPosition.current = null
    },
    [deckRef, multiSelectRadar],
  )

  return {
    handleRightClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleLeftClick,
  }
}
