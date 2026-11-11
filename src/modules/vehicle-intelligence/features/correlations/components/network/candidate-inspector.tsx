import {
  GRAPH,
  type GraphEdge,
} from '@/modules/vehicle-intelligence/features/correlations/graph-variants'
import { strengthColor } from '@/modules/vehicle-intelligence/features/correlations/network-layout'
import { compactDateTime } from '@/modules/vehicle-intelligence/features/correlations/ranking-cells'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { recentActivityWindow } from '@/modules/vehicle-intelligence/lib/recent-activity'
import type {
  CorrelationRankingRow,
  PreEventCandidate,
} from '@/modules/vehicle-intelligence/types/domain'

/** Resumo da placa correlata: ocorrências, força ou proximidade, medidas da estratégia, Cerco e ligações visíveis. */
export function CandidateInspector({
  selectedCandidate,
  selectedOutsideVisibleGraph,
  selectedConnections,
}: {
  selectedCandidate: PreEventCandidate | CorrelationRankingRow
  /** Escolhida no ranking e fora do desenho. */
  selectedOutsideVisibleGraph: boolean
  selectedConnections: GraphEdge[]
}) {
  const selectedStrength = selectedCandidate?.correlation_strength
  const selectedLinkBands = {
    high: selectedConnections.filter(
      (edge) => (edge.correlation_strength ?? 0) >= 70,
    ).length,
    medium: selectedConnections.filter(
      (edge) =>
        (edge.correlation_strength ?? 0) >= 40 &&
        (edge.correlation_strength ?? 0) < 70,
    ).length,
    low: selectedConnections.filter(
      (edge) => (edge.correlation_strength ?? 0) < 40,
    ).length,
  }
  const selectedActivityWindow = selectedCandidate
    ? recentActivityWindow(selectedCandidate)
    : null
  return (
    <>
      <div className="inspector-stats">
        <div>
          <strong>{selectedCandidate.linked_events}</strong>
          <span>Ocorrências</span>
        </div>
        <div>
          <strong>{selectedCandidate.distinct_days ?? '—'}</strong>
          <span>Dias distintos</span>
        </div>
        <div>
          <strong>{selectedCandidate.cisp_count}</strong>
          <span>CISPs</span>
        </div>
      </div>
      <div className="inspector-body">
        <section className="inspector-metric">
          <div>
            <strong>{GRAPH.strengthLabel}</strong>
            <span>
              {selectedStrength != null
                ? selectedStrength
                : selectedOutsideVisibleGraph
                  ? 'Fora do grafo'
                  : '—'}
            </span>
          </div>
          <div className="inspector-strength-track">
            <i
              style={{
                width: `${Math.max(0, Math.min(100, selectedStrength ?? 0))}%`,
                background: strengthColor(selectedStrength ?? 0),
              }}
            />
          </div>
          <small>
            Média {selectedCandidate.average_correlation_strength ?? '—'} ·
            escala descritiva, não mede autoria
          </small>
        </section>
        <div className="inspector-metric-grid">
          {GRAPH.candidateCards(selectedCandidate).map(([label, value]) => (
            <div key={label}>
              <small>{label}</small>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <section className="inspector-metric">
          <strong>
            Cerco Eletrônico{' '}
            <small>
              {selectedCandidate.recent_activity_last_seen
                ? `· Última ${compactDateTime(selectedCandidate.recent_activity_last_seen)}`
                : ''}
            </small>
          </strong>
          <div className="inspector-cerco">
            {([7, 15, 30, 45] as const).map((days) => (
              <div
                key={days}
                className={
                  days === Number(selectedActivityWindow) ? 'active' : ''
                }
              >
                <small>{days} d</small>
                <b>{formatNumber(selectedCandidate[`detections_${days}d`])}</b>
              </div>
            ))}
          </div>
        </section>
        <div className="inspector-links-legend">
          <strong>{selectedConnections.length} ligações visíveis</strong>
          <div className="inspector-link-band">
            <i
              style={{ flex: selectedLinkBands.high, background: '#ff5266' }}
            />
            <i
              style={{ flex: selectedLinkBands.medium, background: '#18c7dd' }}
            />
            <i style={{ flex: selectedLinkBands.low, background: '#9fb4ba' }} />
          </div>
          <span>
            <i className="high" /> Alta · {selectedLinkBands.high}
          </span>
          <span>
            <i className="medium" /> Intermediária · {selectedLinkBands.medium}
          </span>
          <span>
            <i className="low" /> Baixa · {selectedLinkBands.low}
          </span>
        </div>
      </div>
    </>
  )
}
