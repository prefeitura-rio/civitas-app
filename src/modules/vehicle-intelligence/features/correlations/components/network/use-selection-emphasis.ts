import { useEffect } from 'react'

import type { VisNetwork } from '@/modules/vehicle-intelligence/features/correlations/components/network/use-vis-network'
import type {
  GraphData,
  GraphDisplay,
} from '@/modules/vehicle-intelligence/features/correlations/graph-display'
import {
  focusFrame,
  strengthColor,
} from '@/modules/vehicle-intelligence/features/correlations/network-layout'

/**
 * Aplica a seleção à rede montada, sem desfazer o layout: esmaece o resto, destaca a união das ligações das placas
 * escolhidas e enquadra (ou foca) a seleção depois das posições definitivas.
 */
export function useSelectionEmphasis(
  {
    networkRef,
    restoredViewKeyRef,
    unfocusedPositionsRef,
    nodesRef,
    edgesRef,
    organizingLayoutRef,
    containerRef,
    layoutRevision,
    prefersReducedMotion,
  }: VisNetwork,
  {
    data,
    display,
    graphFingerprint,
    selectedPlates,
    selectedSet,
    selectionRevision,
  }: {
    data: GraphData
    display: GraphDisplay
    graphFingerprint: string
    selectedPlates: string[]
    selectedSet: ReadonlySet<string>
    selectionRevision: number
  },
) {
  const visibleEdges = display.edges
  const visibleNodeIds = display.nodeIds
  useEffect(() => {
    const network = networkRef.current
    if (!network) return
    const hasSelection = selectedSet.size > 0
    const preserveRestoredView = restoredViewKeyRef.current === graphFingerprint
    if (!(preserveRestoredView && hasSelection && selectionRevision === 0)) {
      for (const [id, point] of Object.entries(unfocusedPositionsRef.current))
        network.moveNode(id, point.x, point.y)
      unfocusedPositionsRef.current = {}
    }
    restoredViewKeyRef.current = null
    // Destaca a união das ligações de todos os nós selecionados.
    const emphasized = visibleEdges.filter(
      (edge) => selectedSet.has(edge.source) || selectedSet.has(edge.target),
    )
    const emphasizedEdges = new Set(
      emphasized.map((edge) => `${edge.source}:${edge.target}`),
    )
    const emphasizedNodes = new Set(
      emphasized.flatMap((edge) => [edge.source, edge.target]),
    )
    selectedSet.forEach((id) => {
      if (visibleNodeIds.has(id)) emphasizedNodes.add(id)
    })
    nodesRef.current?.update(
      data.graph.nodes
        .filter((node) => visibleNodeIds.has(node.id))
        .map((node) => ({
          id: node.id,
          opacity: !hasSelection || emphasizedNodes.has(node.id) ? 1 : 0.14,
          label:
            !hasSelection || emphasizedNodes.has(node.id) ? node.label : '',
          font: { size: node.kind === 'candidate' ? 13 : 11 },
          scaling: {
            label: { enabled: true, min: 11, max: 18, drawThreshold: 8 },
          },
        })),
    )
    edgesRef.current?.update(
      visibleEdges.map((edge) => ({
        id: `${edge.source}:${edge.target}`,
        color: {
          color: !hasSelection
            ? strengthColor(edge.correlation_strength ?? 0)
            : emphasizedEdges.has(`${edge.source}:${edge.target}`)
              ? (edge.correlation_strength ?? 0) >= 70
                ? '#ff5266'
                : (edge.correlation_strength ?? 0) >= 40
                  ? '#18c7dd'
                  : '#9fb4ba'
              : 'rgba(159,180,186,.035)',
          highlight: '#ffffff',
          hover: '#ffffff',
          inherit: false,
        },
        smooth: { enabled: false, type: 'continuous', roundness: 0.18 },
      })),
    )
    // Enquadra ou foca a placa apenas depois das posições definitivas.
    if (organizingLayoutRef.current) return
    if (!hasSelection) {
      network.unselectAll()
      if (selectionRevision > 0)
        network.fit({
          animation: prefersReducedMotion
            ? false
            : { duration: 450, easingFunction: 'easeInOutQuad' },
        })
      return
    }
    const visibleSelection = selectedPlates.filter((id) =>
      visibleNodeIds.has(id),
    )
    if (!visibleSelection.length) return
    network.selectNodes(visibleSelection, false)
    if (preserveRestoredView && selectionRevision === 0) return
    const positions = network.getPositions([...emphasizedNodes])
    const width = containerRef.current?.clientWidth ?? 800
    const height = containerRef.current?.clientHeight ?? 720
    const reservedWidth = width > 600 ? 324 : 0
    const reservedHeight =
      width <= 600
        ? (containerRef.current?.parentElement?.querySelector(
            '.network-inspector',
          )?.clientHeight ?? 420) + 24
        : 0
    const { bounds, scale } = focusFrame(
      Object.values(positions),
      width,
      height,
      reservedWidth,
      reservedHeight,
    )
    // Keep focused labels readable in screen pixels even when distant neighbors require zooming out.
    nodesRef.current?.update(
      [...emphasizedNodes].map((id) => ({
        id,
        font: { size: 12 / scale },
        scaling: {
          label: { enabled: false, drawThreshold: 0, maxVisible: 100000 },
        },
      })),
    )
    network.moveTo({
      position: {
        x: (bounds.left + bounds.right) / 2,
        y: (bounds.top + bounds.bottom) / 2,
      },
      scale,
      offset: { x: -reservedWidth / 2, y: -reservedHeight / 2 },
      animation:
        prefersReducedMotion || selectionRevision === 0
          ? false
          : { duration: 450, easingFunction: 'easeInOutQuad' },
    })
  }, [
    containerRef,
    data.graph.nodes,
    edgesRef,
    graphFingerprint,
    layoutRevision,
    nodesRef,
    networkRef,
    organizingLayoutRef,
    prefersReducedMotion,
    restoredViewKeyRef,
    selectedPlates,
    selectedSet,
    selectionRevision,
    unfocusedPositionsRef,
    visibleEdges,
    visibleNodeIds,
  ])
}
