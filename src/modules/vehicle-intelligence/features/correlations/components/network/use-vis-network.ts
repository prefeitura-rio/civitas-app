import { useEffect, useRef, useState } from 'react'
import { DataSet } from 'vis-data'
import type { Edge, Node } from 'vis-network'
import { Network } from 'vis-network'

import { authorCitationNote } from '@/modules/vehicle-intelligence/components/plate/author-citations'
import type {
  GraphData,
  GraphDisplay,
} from '@/modules/vehicle-intelligence/features/correlations/graph-display'
import { GRAPH } from '@/modules/vehicle-intelligence/features/correlations/graph-variants'
import {
  ANCHOR_NODE_SIZE,
  LAYOUT_ITERATIONS,
  LAYOUT_TIME_LIMIT_MS,
  spiralPositions,
  strengthColor,
} from '@/modules/vehicle-intelligence/features/correlations/network-layout'
import { networkOptions } from '@/modules/vehicle-intelligence/features/correlations/network-options'
import {
  type SelectMode,
  selectModeFor,
} from '@/modules/vehicle-intelligence/features/correlations/selection'
import {
  loadGraphLayout,
  saveGraphLayout,
} from '@/modules/vehicle-intelligence/features/correlations/session'
import type {
  CorrelationRankingRow,
  PreEventCandidate,
} from '@/modules/vehicle-intelligence/types/domain'

export type VisNetwork = ReturnType<typeof useVisNetwork>

/**
 * A rede do vis-network montada no `containerRef`: criada uma vez e reaproveitada a cada desenho novo
 * (`graphFingerprint`), com o layout organizado pela física e guardado na sessão (ver session.ts).
 */
export function useVisNetwork({
  active,
  data,
  stateKey,
  selectedPlates,
  selectedSet,
  rankingRows,
  onSelect,
  display,
  candidateByPlate,
  authorshipCitationByPlate,
  graphFingerprint,
}: {
  active: boolean
  data: GraphData
  stateKey: string
  selectedPlates: string[]
  selectedSet: ReadonlySet<string>
  rankingRows: Record<string, CorrelationRankingRow>
  onSelect: (plate: string | null, mode?: SelectMode) => void
  display: GraphDisplay
  candidateByPlate: ReadonlyMap<string, PreEventCandidate>
  authorshipCitationByPlate: ReadonlyMap<string, string>
  graphFingerprint: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active
  const selectionRef = useRef(selectedPlates)
  selectionRef.current = selectedPlates
  const lastVisibleView = useRef<{
    position: { x: number; y: number }
    scale: number
  } | null>(null)
  const networkRef = useRef<Network | null>(null)
  const organizeGraphRef = useRef<(reset?: boolean) => void>(() => undefined)
  const needsOrganizationRef = useRef(false)
  const organizingLayoutRef = useRef(false)
  const nodesRef = useRef<DataSet<Node> | null>(null)
  const edgesRef = useRef<DataSet<Edge> | null>(null)
  const unfocusedPositionsRef = useRef<
    Record<string, { x: number; y: number }>
  >({})
  const previousGraphRef = useRef<{
    stateKey: string
    positions: Record<string, { x: number; y: number }>
    view: { position: { x: number; y: number }; scale: number }
  } | null>(null)
  const persistGraphRef = useRef<() => void>(() => undefined)
  const restoredViewKeyRef = useRef<string | null>(null)
  const [physicsEnabled, setPhysicsEnabled] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [status, setStatus] = useState('Organizando a rede…')
  const [layoutRevision, setLayoutRevision] = useState(0)
  const [organizingLayout, setOrganizingLayout] = useState(true)
  const [layoutProgress, setLayoutProgress] = useState(0)
  const visibleEdges = display.edges
  const visibleNodeIds = display.nodeIds

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const restoredGraph =
      loadGraphLayout(graphFingerprint) ??
      (previousGraphRef.current?.stateKey === stateKey
        ? previousGraphRef.current
        : null)
    const nodeMap = new Map<string, Node>()
    // A posição inicial não separa tipos. A física aproxima os nós ligados.
    const initialPositions = spiralPositions(display.nodes)
    const hasNewNodes = [...initialPositions.keys()].some(
      (id) => !restoredGraph?.positions[id],
    )
    needsOrganizationRef.current = hasNewNodes
    data.graph.nodes.forEach((item) => {
      if (!visibleNodeIds.has(item.id)) return
      const candidate =
        candidateByPlate.get(item.id) ?? rankingRows[item.id] ?? null
      if (candidate) {
        const citation =
          authorshipCitationByPlate.get(item.id) ??
          authorCitationNote(candidate.author_citations) ??
          undefined
        const position =
          restoredGraph?.positions[item.id] ??
          (selectedSet.has(item.id) && rankingRows[item.id]
            ? networkRef.current?.getViewPosition()
            : null) ??
          initialPositions.get(item.id)!
        nodeMap.set(item.id, {
          id: item.id,
          label: citation ? `${item.label}\nCITADA NA DINÂMICA` : item.label,
          group: candidate.is_clone_confirmed
            ? 'candidateCloneConfirmed'
            : candidate.is_clone_suspect
              ? 'candidateClone'
              : citation
                ? 'authorCited'
                : GRAPH.highlighted(candidate)
                  ? 'candidateKnown'
                  : 'candidateNew',
          value:
            18 +
            Math.min(candidate.linked_events, 28) +
            (candidate.correlation_strength || 0) / 10,
          mass: 3.5 + Math.log1p(candidate.linked_events),
          x: position.x,
          y: position.y,
          title:
            'score' in candidate
              ? GRAPH.candidateTitle(item.label, candidate, citation)
              : `${item.label}\nPlaca correlata`,
        })
      } else if (!nodeMap.has(item.id)) {
        const position =
          restoredGraph?.positions[item.id] ?? initialPositions.get(item.id)!
        nodeMap.set(item.id, {
          id: item.id,
          label: item.label,
          group: 'anchor',
          shape: 'dot',
          size: ANCHOR_NODE_SIZE,
          borderWidth: 1.5,
          font: { size: 11, color: '#cfe6ff' },
          mass: 2,
          x: position.x,
          y: position.y,
          title: GRAPH.anchorTitle(item),
        })
      }
    })

    const nodes = new DataSet<Node>([...nodeMap.values()])
    const edges = new DataSet<Edge>(
      visibleEdges.map((item) => ({
        id: `${item.source}:${item.target}`,
        from: item.source,
        to: item.target,
        value: Math.max(
          1,
          item.weight * (0.35 + (item.correlation_strength || 0) / 100),
        ),
        width: Math.min(
          1 + item.weight * 0.45 + (item.correlation_strength || 0) / 30,
          8,
        ),
        color: {
          color: strengthColor(item.correlation_strength || 0),
          highlight: '#ffffff',
          hover: '#ffffff',
          inherit: false,
        },
        title: GRAPH.edgeTitle(item),
        smooth: { enabled: false, type: 'continuous', roundness: 0.18 },
        length: candidateByPlate.has(item.source) ? 125 : 205,
      })),
    )
    nodesRef.current = nodes
    edgesRef.current = edges

    const options = networkOptions()

    const previousNetwork = networkRef.current
    const previousView = previousNetwork
      ? {
          position: previousNetwork.getViewPosition(),
          scale: previousNetwork.getScale(),
        }
      : null
    organizingLayoutRef.current = hasNewNodes
    const network =
      previousNetwork ??
      new Network(containerRef.current, { nodes, edges }, options)
    if (previousNetwork) {
      network.setOptions(options)
      network.setData({ nodes, edges })
      // setData também executa o fit automático do vis-network. Restaura a
      // câmera antes do próximo desenho, enquanto o novo layout é calculado.
      if (previousView) network.moveTo({ ...previousView, animation: false })
    }
    networkRef.current = network
    if (restoredGraph && 'basePositions' in restoredGraph)
      unfocusedPositionsRef.current = restoredGraph.basePositions ?? {}
    let canPersistGraph = Boolean(restoredGraph)
    let layoutTimer: number | undefined
    let layoutStartTimer: number | undefined
    let organizing = false
    setOrganizingLayout(false)
    const persistGraph = () => {
      if (!canPersistGraph) return
      const positions = network.getPositions(nodes.getIds())
      saveGraphLayout({
        fingerprint: graphFingerprint,
        positions,
        basePositions: unfocusedPositionsRef.current,
        view:
          activeRef.current && containerRef.current?.clientWidth
            ? { position: network.getViewPosition(), scale: network.getScale() }
            : (lastVisibleView.current ?? {
                position: network.getViewPosition(),
                scale: network.getScale(),
              }),
      })
    }
    persistGraphRef.current = persistGraph
    let persistTimer: number | undefined
    const queuePersist = () => {
      window.clearTimeout(persistTimer)
      persistTimer = window.setTimeout(persistGraph, 120)
    }
    const finishOrganization = () => {
      if (!organizing) return
      organizing = false
      window.clearTimeout(layoutTimer)
      network.stopSimulation()
      network.setOptions({ physics: { enabled: false } })
      if (activeRef.current && !selectionRef.current.length)
        network.fit({ animation: false })
      setPhysicsEnabled(false)
      organizingLayoutRef.current = false
      setOrganizingLayout(false)
      setLayoutProgress(100)
      setLayoutRevision((revision) => revision + 1)
      setStatus(`${nodes.length} nós · ${edges.length} ligações`)
      canPersistGraph = true
      persistGraph()
    }
    const organizeGraph = (reset = false) => {
      window.clearTimeout(layoutTimer)
      window.clearTimeout(layoutStartTimer)
      organizing = false
      network.stopSimulation()
      if (reset)
        initialPositions.forEach((position, id) =>
          network.moveNode(id, position.x, position.y),
        )
      needsOrganizationRef.current = false
      canPersistGraph = false
      organizingLayoutRef.current = true
      setOrganizingLayout(true)
      setLayoutProgress(0)
      setPhysicsEnabled(true)
      setStatus('Organizando a rede pelas ligações…')
      // Permite que o lote anterior termine antes de iniciar outro no canvas.
      layoutStartTimer = window.setTimeout(() => {
        organizing = true
        network.setOptions({ physics: { enabled: true } })
        layoutTimer = window.setTimeout(
          finishOrganization,
          LAYOUT_TIME_LIMIT_MS,
        )
        network.stabilize(LAYOUT_ITERATIONS)
      }, 0)
    }
    organizeGraphRef.current = organizeGraph
    let reportedProgress = -1
    const stabilizationProgress = ({
      iterations,
      total,
    }: {
      iterations: number
      total: number
    }) => {
      const progress = Math.floor((iterations / total) * 10) * 10
      if (organizing && progress !== reportedProgress) {
        reportedProgress = progress
        setLayoutProgress(progress)
        setStatus(`Organizando ligações… ${progress}%`)
      }
    }
    network.on('stabilizationProgress', stabilizationProgress)
    network.on('stabilizationIterationsDone', finishOrganization)
    if (restoredGraph && !hasNewNodes) {
      network.stopSimulation()
      setPhysicsEnabled(false)
      organizingLayoutRef.current = false
      restoredViewKeyRef.current = graphFingerprint
      network.moveTo({
        position: restoredGraph.view.position,
        scale: restoredGraph.view.scale,
        animation: false,
      })
      setStatus(
        `${nodes.length} nós · ${edges.length} ligações · estado restaurado`,
      )
    } else {
      const awaitingLinks = selectedPlates.some(
        (plate) =>
          rankingRows[plate] &&
          !visibleEdges.some((edge) => edge.target === plate),
      )
      if (awaitingLinks && restoredGraph) {
        organizingLayoutRef.current = false
        needsOrganizationRef.current = false
        canPersistGraph = true
        setStatus('Buscando ligações da placa selecionada…')
      } else if (activeRef.current) organizeGraph()
    }
    const afterDrawing = () => {
      if (activeRef.current && containerRef.current?.clientWidth) {
        lastVisibleView.current = {
          position: network.getViewPosition(),
          scale: network.getScale(),
        }
      }
    }
    network.on('afterDrawing', afterDrawing)
    network.on('dragEnd', queuePersist)
    network.on('zoom', queuePersist)
    // Clique escolhe um nó; Ctrl, Cmd ou Shift + clique soma ou tira o nó da seleção.
    const selectNode = (params: {
      nodes: Array<string | number>
      event?: { srcEvent?: MouseEvent }
    }) => {
      const mode = params.event?.srcEvent
        ? selectModeFor(params.event.srcEvent)
        : 'replace'
      const clicked = params.nodes.length ? String(params.nodes[0]) : null
      if (clicked || mode === 'replace') onSelect(clicked, mode)
      persistGraph()
    }
    network.on('click', selectNode)
    window.addEventListener('pagehide', persistGraph)

    return () => {
      window.clearTimeout(persistTimer)
      window.clearTimeout(layoutTimer)
      window.clearTimeout(layoutStartTimer)
      organizing = false
      network.stopSimulation()
      persistGraph()
      previousGraphRef.current = canPersistGraph
        ? {
            stateKey,
            positions: {
              ...network.getPositions(),
              ...unfocusedPositionsRef.current,
            },
            view: {
              position: network.getViewPosition(),
              scale: network.getScale(),
            },
          }
        : null
      unfocusedPositionsRef.current = {}
      window.removeEventListener('pagehide', persistGraph)
      persistGraphRef.current = () => undefined
      organizeGraphRef.current = () => undefined
      network.off('afterDrawing', afterDrawing)
      network.off('dragEnd', queuePersist)
      network.off('zoom', queuePersist)
      network.off('click', selectNode)
      network.off('stabilizationProgress', stabilizationProgress)
      network.off('stabilizationIterationsDone', finishOrganization)
      network.stopSimulation()
    }
    // A rede só é recriada quando o grafo desenhado muda (graphFingerprint resume nós e ligações visíveis); a
    // seleção é aplicada à rede montada pelo efeito seguinte, sem desfazer o layout. O resto é lido na criação.
    // Dependências incompletas de propósito.
  }, [
    authorshipCitationByPlate,
    candidateByPlate,
    graphFingerprint,
    onSelect,
    stateKey,
  ])

  useEffect(
    () => () => {
      networkRef.current?.destroy()
      networkRef.current = null
    },
    [],
  )

  return {
    containerRef,
    lastVisibleView,
    networkRef,
    organizeGraphRef,
    needsOrganizationRef,
    organizingLayoutRef,
    nodesRef,
    edgesRef,
    unfocusedPositionsRef,
    persistGraphRef,
    restoredViewKeyRef,
    physicsEnabled,
    setPhysicsEnabled,
    prefersReducedMotion,
    status,
    setStatus,
    layoutRevision,
    organizingLayout,
    layoutProgress,
  }
}
