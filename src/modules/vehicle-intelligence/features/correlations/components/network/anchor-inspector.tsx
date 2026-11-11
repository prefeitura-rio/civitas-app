import type { RefObject } from 'react'
import type { Network } from 'vis-network'

import {
  GRAPH,
  type GraphEdge,
  type GraphNode,
} from '@/modules/vehicle-intelligence/features/correlations/graph-variants'
import { strengthColor } from '@/modules/vehicle-intelligence/features/correlations/network-layout'
import { VehicleTypeText } from '@/modules/vehicle-intelligence/features/correlations/ranking-cells'
import {
  type SelectMode,
  selectModeFor,
} from '@/modules/vehicle-intelligence/features/correlations/selection'
import type { PreEventCandidate } from '@/modules/vehicle-intelligence/types/domain'

/** Resumo da âncora (RO ou placa vítima): o fato, as contagens e as placas ligadas, da mais forte à mais fraca. */
export function AnchorInspector({
  selectedEventNode,
  selectedConnections,
  candidateByPlate,
  onSelect,
  networkRef,
}: {
  selectedEventNode: GraphNode
  selectedConnections: GraphEdge[]
  candidateByPlate: ReadonlyMap<string, PreEventCandidate>
  onSelect: (plate: string | null, mode?: SelectMode) => void
  networkRef: RefObject<Network>
}) {
  const selectedEventConnections = selectedConnections
    .slice()
    .sort(
      (left, right) =>
        (right.correlation_strength ?? 0) - (left.correlation_strength ?? 0),
    )
  return (
    <>
      {selectedEventNode.crime !== undefined && (
        <>
          <div className="event-inspector-crime">
            <i />
            {selectedEventNode.crime ?? 'Tipo de ocorrência não informado'}
          </div>
          <dl className="event-inspector-details">
            <div>
              <dt>Data e hora</dt>
              <dd>{selectedEventNode.occurred_at ?? '—'}</dd>
            </div>
            <div>
              <dt>Local</dt>
              <dd>{selectedEventNode.address ?? 'Local não informado'}</dd>
            </div>
            <div>
              <dt>Autor</dt>
              <dd>{selectedEventNode.author_mode ?? 'Não informado'}</dd>
            </div>
            <div>
              <dt>Horário</dt>
              <dd>{selectedEventNode.timing ?? 'Não informado'}</dd>
            </div>
          </dl>
        </>
      )}
      <div className="inspector-stats">
        <div>
          <strong>
            {selectedEventNode.linked_plates ?? selectedEventConnections.length}
          </strong>
          <span>Placas ligadas</span>
        </div>
        <div>
          <strong>
            {selectedEventNode.reading_count ??
              selectedEventConnections.reduce(
                (sum, edge) => sum + edge.weight,
                0,
              )}
          </strong>
          <span>Leituras</span>
        </div>
        <div>
          <strong>
            {selectedEventNode.high_strength_count ??
              selectedEventConnections.filter(
                (edge) => (edge.correlation_strength ?? 0) >= 70,
              ).length}
          </strong>
          <span>Ligações ≥70</span>
        </div>
      </div>
      <div className="event-plate-list">
        {selectedEventConnections.length ? (
          selectedEventConnections.map((edge) => {
            const candidate = candidateByPlate.get(edge.target)
            const [first, second] = GRAPH.edgeCells(edge)
            return (
              <button
                type="button"
                key={edge.target}
                onClick={(event) => {
                  onSelect(edge.target, selectModeFor(event))
                  networkRef.current?.focus(edge.target, {
                    scale: networkRef.current.getScale(),
                    animation: true,
                  })
                }}
              >
                <span>
                  <strong>{edge.target}</strong>
                  <small>
                    <VehicleTypeText
                      fields={candidate ?? {}}
                      fallback="Placa correlata"
                    />
                  </small>
                </span>
                <small>{first}</small>
                <small>{second}</small>
                <b>
                  <i
                    style={{
                      background: strengthColor(edge.correlation_strength ?? 0),
                    }}
                  />
                  {edge.correlation_strength ?? '—'}
                </b>
              </button>
            )
          })
        ) : (
          <p>Nenhuma placa ligada está visível neste desenho.</p>
        )}
        <small>
          Ordenado por {GRAPH.strengthLabel.toLowerCase()} · clique para focar a
          placa
          {(selectedEventNode.hidden_plates ?? 0) > 0
            ? ` · +${selectedEventNode.hidden_plates} placas fora da lista`
            : ''}
        </small>
      </div>
    </>
  )
}
