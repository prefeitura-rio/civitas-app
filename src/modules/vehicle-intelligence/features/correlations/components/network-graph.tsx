import 'vis-network/styles/vis-network.css'

import { LoaderCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { GraphControls } from '@/modules/vehicle-intelligence/features/correlations/components/network/graph-controls'
import { GraphDisplaySummary } from '@/modules/vehicle-intelligence/features/correlations/components/network/graph-display-summary'
import { GraphEdgeTable } from '@/modules/vehicle-intelligence/features/correlations/components/network/graph-edge-table'
import { GraphHeading } from '@/modules/vehicle-intelligence/features/correlations/components/network/graph-heading'
import { NetworkInspector } from '@/modules/vehicle-intelligence/features/correlations/components/network/network-inspector'
import { useSelectionEmphasis } from '@/modules/vehicle-intelligence/features/correlations/components/network/use-selection-emphasis'
import { useVisNetwork } from '@/modules/vehicle-intelligence/features/correlations/components/network/use-vis-network'
import {
  DEFAULT_VISIBLE_ROS,
  type GraphData,
  graphDisplay,
} from '@/modules/vehicle-intelligence/features/correlations/graph-display'
import { GRAPH } from '@/modules/vehicle-intelligence/features/correlations/graph-variants'
import { graphFingerprint as fingerprintOf } from '@/modules/vehicle-intelligence/features/correlations/network-layout'
import type { SelectMode } from '@/modules/vehicle-intelligence/features/correlations/selection'
import type { CorrelationRankingRow } from '@/modules/vehicle-intelligence/types/domain'

export function NetworkGraph({
  active,
  data,
  stateKey,
  selectedPlates,
  rankingRows,
  selectionRevision,
  focusLoading,
  focusError,
  loadingData,
  onSelect,
  onOpenPlate,
  onOpenOccurrence,
}: {
  active: boolean
  data: GraphData
  stateKey: string
  /** Nós selecionados; o último é o que o inspetor mostra. */
  selectedPlates: string[]
  /** Linhas do ranking das placas escolhidas na tabela, para as que estão fora do desenho. */
  rankingRows: Record<string, CorrelationRankingRow>
  selectionRevision: number
  focusLoading: boolean
  focusError: string | null
  loadingData: boolean
  onSelect: (plate: string | null, mode?: SelectMode) => void
  onOpenPlate: (plate: string, analysis: 'correlations' | 'trends') => void
  onOpenOccurrence: (key: string) => void
}) {
  const [roLimit, setRoLimit] = useState(DEFAULT_VISIBLE_ROS)

  const candidateByPlate = useMemo(
    () => new Map(data.candidates.map((item) => [item.plate, item])),
    [data.candidates],
  )
  const authorshipCitationByPlate = useMemo(
    () =>
      new Map(
        (data.authorship_plate_citations ?? []).map((citation) => [
          citation.plate,
          citation.note,
        ]),
      ),
    [data.authorship_plate_citations],
  )
  const selectedSet = useMemo(() => new Set(selectedPlates), [selectedPlates])
  const selectedId = selectedPlates.at(-1) ?? null
  const display = useMemo(
    () => graphDisplay(data.graph, roLimit, selectedSet),
    [data.graph, roLimit, selectedSet],
  )
  const visibleEdges = display.edges
  const visibleNodeIds = display.nodeIds
  const selectedGraphCandidate = selectedId
    ? candidateByPlate.get(selectedId)
    : undefined
  const selectedTableCandidate = selectedId
    ? rankingRows[selectedId]
    : undefined
  const selectedCandidate = selectedTableCandidate ?? selectedGraphCandidate
  const selectedOutsideVisibleGraph = Boolean(
    selectedTableCandidate && !selectedGraphCandidate,
  )
  const selectedConnections = selectedId
    ? visibleEdges.filter(
        (edge) => edge.source === selectedId || edge.target === selectedId,
      )
    : []
  const graphFingerprint = useMemo(
    () => fingerprintOf(stateKey, display.nodes, visibleEdges),
    [display.nodes, visibleEdges, stateKey],
  )

  const network = useVisNetwork({
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
  })
  const {
    containerRef,
    lastVisibleView,
    networkRef,
    organizeGraphRef,
    needsOrganizationRef,
    persistGraphRef,
    physicsEnabled,
    setPhysicsEnabled,
    prefersReducedMotion,
    status,
    setStatus,
    organizingLayout,
    layoutProgress,
  } = network
  useSelectionEmphasis(network, {
    data,
    display,
    graphFingerprint,
    selectedPlates,
    selectedSet,
    selectionRevision,
  })

  const hiddenView = useRef<{
    position: { x: number; y: number }
    scale: number
  } | null>(null)
  useEffect(() => {
    const network = networkRef.current
    if (!network) return
    if (!active) {
      hiddenView.current = lastVisibleView.current
      persistGraphRef.current()
      network.stopSimulation()
      network.setOptions({ autoResize: false })
      setPhysicsEnabled(false)
    } else {
      network.setOptions({ autoResize: true })
      network.setSize('100%', '100%')
      network.redraw()
      if (hiddenView.current)
        network.moveTo({ ...hiddenView.current, animation: false })
      if (needsOrganizationRef.current) organizeGraphRef.current()
    }
  }, [
    active,
    lastVisibleView,
    needsOrganizationRef,
    networkRef,
    organizeGraphRef,
    persistGraphRef,
    setPhysicsEnabled,
  ])

  const togglePhysics = () => {
    if (prefersReducedMotion) return
    const next = !physicsEnabled
    if (next) {
      networkRef.current?.setOptions({ physics: { enabled: true } })
      networkRef.current?.startSimulation()
    } else {
      networkRef.current?.stopSimulation()
      networkRef.current?.setOptions({ physics: { enabled: false } })
    }
    setPhysicsEnabled(next)
    setStatus(
      next
        ? 'Reorganizando a rede…'
        : `${visibleNodeIds.size} nós · ${visibleEdges.length} ligações`,
    )
    if (!next) persistGraphRef.current()
  }

  const redrawGraph = () => {
    organizeGraphRef.current(true)
  }
  const selectedEventNode =
    selectedId && !selectedCandidate
      ? data.graph.nodes.find(
          (node) => node.id === selectedId && node.kind !== 'candidate',
        )
      : undefined

  const anchors = GRAPH.anchor.plural
  const selectedCitation = selectedId
    ? authorshipCitationByPlate.get(selectedId)
    : undefined
  return (
    <section className="panel force-graph-panel">
      <GraphHeading />
      <GraphControls
        roLimit={roLimit}
        setRoLimit={setRoLimit}
        networkRef={networkRef}
        redrawGraph={redrawGraph}
        physicsEnabled={physicsEnabled}
        prefersReducedMotion={prefersReducedMotion}
        togglePhysics={togglePhysics}
        selectedId={selectedId}
        selectedPlates={selectedPlates}
        onSelect={onSelect}
        status={status}
      />
      <GraphDisplaySummary
        display={display}
        selectedPlates={selectedPlates}
        candidateByPlate={candidateByPlate}
      />
      <div
        className="force-network-shell"
        aria-busy={organizingLayout || focusLoading || loadingData}
      >
        {(organizingLayout || focusLoading || loadingData) && (
          <div className="network-loading" role="status" aria-live="polite">
            <LoaderCircle
              size={22}
              className="query-loading-spinner"
              aria-hidden="true"
            />
            <div>
              <strong>
                {focusLoading
                  ? `Carregando ligações ${selectedPlates.length > 1 ? 'das placas selecionadas' : 'da placa selecionada'}…`
                  : loadingData
                    ? 'Atualizando a rede…'
                    : 'Organizando a rede…'}
              </strong>
              {organizingLayout && !focusLoading && !loadingData && (
                <progress
                  max={100}
                  value={layoutProgress}
                  aria-label="Progresso da organização da rede"
                />
              )}
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="force-network"
          style={{ visibility: organizingLayout ? 'hidden' : 'visible' }}
          role="img"
          aria-label={`Grafo interativo com ${display.visibleEvents} ${anchors}, ${visibleNodeIds.size - display.visibleEvents} placas e ${visibleEdges.length} ligações`}
        />
        {selectedId && (
          <NetworkInspector
            selectedId={selectedId}
            selectedPlates={selectedPlates}
            selectedCandidate={selectedCandidate}
            selectedOutsideVisibleGraph={selectedOutsideVisibleGraph}
            selectedEventNode={selectedEventNode}
            selectedConnections={selectedConnections}
            selectedCitation={selectedCitation}
            candidateByPlate={candidateByPlate}
            focusLoading={focusLoading}
            focusError={focusError}
            onSelect={onSelect}
            onOpenPlate={onOpenPlate}
            onOpenOccurrence={onOpenOccurrence}
            networkRef={networkRef}
          />
        )}
      </div>
      <div className="temporal-method">
        <strong>{GRAPH.method.title}</strong>
        {GRAPH.method.lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      <GraphEdgeTable visibleEdges={visibleEdges} />
    </section>
  )
}
