import { useCallback, useEffect, useRef, useState } from 'react'

import { prefersReducedMotion } from '@/modules/vehicle-intelligence/features/post-event/components/shared/map-markers'
import type { MasterPostData } from '@/modules/vehicle-intelligence/features/post-event/types'

/**
 * O polo aberto (origem, desconexão ou radar terminal) e a transição: ao abrir, os pontos do polo crescem depois
 * que o mapa enquadra; ao fechar, encolhem antes. `onOpen` roda a cada polo aberto (a legenda se fecha).
 */
export function usePoleSelection(data: MasterPostData, onOpen: () => void) {
  const [selectedClusterKey, setSelectedClusterKey] = useState<string | null>(
    null,
  )
  const [clusterExpansion, setClusterExpansion] = useState(1)
  const [viewportAnimating, setViewportAnimating] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const selectedOriginId = selectedClusterKey?.startsWith('origin:')
    ? selectedClusterKey.slice('origin:'.length)
    : null
  const selectedDestinationId = selectedClusterKey?.startsWith('destination:')
    ? Number(selectedClusterKey.slice('destination:'.length))
    : null
  const selectedTerminalPointId = selectedClusterKey?.startsWith('terminal:')
    ? selectedClusterKey.slice('terminal:'.length)
    : null
  const selectedDestination =
    data.destination_clusters.find(
      (cluster) => cluster.id === selectedDestinationId,
    ) || null
  const selectedOrigin =
    data.origin_clusters.find((cluster) => cluster.id === selectedOriginId) ||
    null
  const selectedTerminal =
    data.destination_hubs.find(
      (point) => point.point_id === selectedTerminalPointId,
    ) || null
  useEffect(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setSelectedClusterKey(null)
    setClusterExpansion(1)
    setViewportAnimating(false)
  }, [
    data.cluster_connections,
    data.destination_clusters,
    data.destination_hubs,
    data.origin_clusters,
  ])
  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
      }
    },
    [],
  )
  const settleClusterTransition = useCallback(() => {
    setClusterExpansion(1)
    setViewportAnimating(false)
  }, [])

  const cancelScheduledClose = () => {
    if (closeTimerRef.current === null) return
    window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }

  const clearSelection = () => {
    if (!selectedClusterKey) return
    cancelScheduledClose()
    setViewportAnimating(false)
    if (prefersReducedMotion()) {
      setSelectedClusterKey(null)
      setClusterExpansion(1)
      return
    }
    setClusterExpansion(0)
    closeTimerRef.current = window.setTimeout(() => {
      setViewportAnimating(true)
      setSelectedClusterKey(null)
      closeTimerRef.current = null
    }, 180)
  }

  const openDestinationCluster = (clusterId: number) => {
    if (clusterId === selectedDestinationId) {
      clearSelection()
      return
    }
    cancelScheduledClose()
    setViewportAnimating(true)
    setClusterExpansion(0)
    onOpen()
    setSelectedClusterKey(`destination:${clusterId}`)
  }

  const openOriginCluster = (clusterId: string) => {
    if (clusterId === selectedOriginId) {
      clearSelection()
      return
    }
    cancelScheduledClose()
    setViewportAnimating(true)
    setClusterExpansion(0)
    onOpen()
    setSelectedClusterKey(`origin:${clusterId}`)
  }

  const openTerminalPoint = (pointId: string) => {
    if (pointId === selectedTerminalPointId) {
      clearSelection()
      return
    }
    cancelScheduledClose()
    setViewportAnimating(true)
    setClusterExpansion(1)
    onOpen()
    setSelectedClusterKey(`terminal:${pointId}`)
  }

  return {
    selectedClusterKey,
    clusterExpansion,
    viewportAnimating,
    selectedOriginId,
    selectedDestinationId,
    selectedTerminalPointId,
    selectedOrigin,
    selectedDestination,
    selectedTerminal,
    settleClusterTransition,
    clearSelection,
    openDestinationCluster,
    openOriginCluster,
    openTerminalPoint,
  }
}
