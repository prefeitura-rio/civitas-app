import { FileSearch, Waypoints, X } from 'lucide-react'
import type { RefObject } from 'react'
import type { Network } from 'vis-network'

import { CercoBadge } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import { PlateSignals } from '@/modules/vehicle-intelligence/components/plate/plate-signals'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { AnchorInspector } from '@/modules/vehicle-intelligence/features/correlations/components/network/anchor-inspector'
import { CandidateInspector } from '@/modules/vehicle-intelligence/features/correlations/components/network/candidate-inspector'
import { InspectorSelection } from '@/modules/vehicle-intelligence/features/correlations/components/network/inspector-selection'
import {
  GRAPH,
  type GraphEdge,
  type GraphNode,
} from '@/modules/vehicle-intelligence/features/correlations/graph-variants'
import type { SelectMode } from '@/modules/vehicle-intelligence/features/correlations/selection'
import type {
  CorrelationRankingRow,
  PreEventCandidate,
} from '@/modules/vehicle-intelligence/types/domain'

/** O painel ao lado do grafo com o resumo da placa ou da âncora selecionada (a última da seleção). */
export function NetworkInspector({
  selectedId,
  selectedPlates,
  selectedCandidate,
  selectedOutsideVisibleGraph,
  selectedEventNode,
  selectedConnections,
  selectedCitation,
  candidateByPlate,
  focusLoading,
  focusError,
  onSelect,
  onOpenPlate,
  onOpenOccurrence,
  networkRef,
}: {
  selectedId: string
  selectedPlates: string[]
  selectedCandidate: PreEventCandidate | CorrelationRankingRow | undefined
  selectedOutsideVisibleGraph: boolean
  selectedEventNode: GraphNode | undefined
  selectedConnections: GraphEdge[]
  selectedCitation: string | undefined
  candidateByPlate: ReadonlyMap<string, PreEventCandidate>
  focusLoading: boolean
  focusError: string | null
  onSelect: (plate: string | null, mode?: SelectMode) => void
  onOpenPlate: (plate: string, analysis: 'correlations' | 'trends') => void
  /** O perfil do RO (entorno) ou a lista dos ROs da placa vítima (copassagem). */
  onOpenOccurrence: (key: string) => void
  networkRef: RefObject<Network>
}) {
  return (
    <aside
      className={`network-inspector${selectedCandidate ? ' plate-inspector' : ' event-inspector'}`}
      aria-label={`Resumo de ${selectedCandidate ? 'placa correlata' : GRAPH.anchor.singular} ${selectedId}`}
      aria-live="polite"
    >
      <div className="network-inspector-heading">
        <div>
          <small>
            {selectedCandidate ? 'PLACA CORRELATA' : GRAPH.anchor.title}
          </small>
          <strong>
            {selectedCandidate
              ? selectedId
              : GRAPH.anchorName(selectedEventNode, selectedId)}
          </strong>
          {selectedCandidate ? (
            <PlateSignals
              row={selectedCandidate}
              citationNote={selectedCitation}
            />
          ) : (
            GRAPH.anchor.isPlate && (
              <div className="plate-signals">
                <CercoBadge
                  plate={selectedId}
                  className="signal-chip signal-cerco"
                >
                  <i aria-hidden="true" />
                  CERCO
                </CercoBadge>
              </div>
            )
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Fechar resumo e limpar seleção"
          onClick={() => onSelect(null)}
        >
          <X size={16} />
        </Button>
      </div>
      {selectedPlates.length > 1 && (
        <InspectorSelection
          selectedPlates={selectedPlates}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}
      {selectedCandidate && (
        <CandidateInspector
          selectedCandidate={selectedCandidate}
          selectedOutsideVisibleGraph={selectedOutsideVisibleGraph}
          selectedConnections={selectedConnections}
        />
      )}
      {selectedEventNode && (
        <AnchorInspector
          selectedEventNode={selectedEventNode}
          selectedConnections={selectedConnections}
          candidateByPlate={candidateByPlate}
          onSelect={onSelect}
          networkRef={networkRef}
        />
      )}
      {(selectedCandidate || selectedEventNode) && (
        <div className="inspector-footer">
          {selectedCandidate && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="inspector-detail-button"
              onClick={() => onOpenPlate(selectedId, 'correlations')}
            >
              <Waypoints size={15} />
              Abrir perfil
            </Button>
          )}
          {(selectedCandidate || GRAPH.anchor.isPlate) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenPlate(selectedId, 'trends')}
            >
              Tendências
            </Button>
          )}
          {selectedEventNode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onOpenOccurrence(
                  GRAPH.anchor.isPlate
                    ? selectedId
                    : (selectedEventNode.ro ?? selectedId),
                )
              }
            >
              <FileSearch size={15} />
              {GRAPH.anchor.isPlate ? 'ROs da vítima' : 'Perfil do RO'}
            </Button>
          )}
        </div>
      )}
      {focusLoading && <span>Carregando ligações…</span>}
      {focusError && <span role="alert">{focusError}</span>}
    </aside>
  )
}
