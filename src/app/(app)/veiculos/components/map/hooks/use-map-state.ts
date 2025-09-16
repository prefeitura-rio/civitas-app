'use client'

import { type Deck } from 'deck.gl'
import { useCallback, useEffect, useMemo } from 'react'
import { type MapRef } from 'react-map-gl'

import { useMap } from '@/hooks/useContexts/use-map-context'
import { getMapStyle } from '@/utils/get-map-style'

interface UseMapStateProps {
  mapRef: React.RefObject<MapRef | null>
  deckRef: React.RefObject<Deck | null>
}

export function useMapState({ mapRef, deckRef }: UseMapStateProps) {
  const { viewport, setViewport, mapStyle, setMapRef, setDeckRef } = useMap()

  useEffect(() => {
    setMapRef(mapRef.current)
    setDeckRef(deckRef.current)
  }, [setMapRef, setDeckRef, mapRef, deckRef])

  const mapStyleValue = useMemo(() => getMapStyle(mapStyle), [mapStyle])

  const handleViewStateChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: { viewState: any }) => {
      setViewport({ ...e.viewState })
    },
    [setViewport],
  )

  const getCursor = useCallback(
    (params: { isDragging: boolean; isHovering: boolean }) => {
      const { isDragging, isHovering } = params
      if (isDragging) return 'grabbing'
      if (isHovering) return 'pointer'
      return 'grab'
    },
    [],
  )

  return {
    viewport,
    setViewport,
    mapStyleValue,
    handleViewStateChange,
    getCursor,
  }
}
