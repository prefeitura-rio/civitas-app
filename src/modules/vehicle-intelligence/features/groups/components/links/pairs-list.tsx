import type { KeyboardEvent } from 'react'

import {
  edgeKey,
  edgeStatus,
} from '@/modules/vehicle-intelligence/features/groups/components/links/link-layout'
import type { GroupEdge } from '@/modules/vehicle-intelligence/types/groups'

/** O que cada linha da lista repassa ao grafo: clique seleciona, o mouse destaca. */
type EdgeHandlers = (e: GroupEdge) => {
  onClick: (domEvent: { stopPropagation: () => void }) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

/** A lista de pares ao lado do grafo, na ordem de `edges`; Enter ou espaço seleciona o par (`onSelect`). */
export function PairsList({
  edges,
  colors,
  selectedEdge,
  hoveredEdge,
  edgeHandlers,
  onSelect,
}: {
  edges: GroupEdge[]
  colors: Record<string, string>
  selectedEdge: string | null
  hoveredEdge: string | null
  edgeHandlers: EdgeHandlers
  onSelect: (key: string) => void
}) {
  return (
    <div className="group-links-list" role="table" aria-label="Pares">
      <div className="group-links-head" role="row">
        <span role="columnheader">Par</span>
        <span
          role="columnheader"
          className="num"
          title="Passaram juntas perto do fato"
        >
          No fato
        </span>
        <span role="columnheader" className="num" title="Desconectaram juntas">
          Desc.
        </span>
        <span
          role="columnheader"
          className="num"
          title="Juntas fora dos fatos (dias)"
        >
          Fora
        </span>
        <span role="columnheader">Situação</span>
      </div>
      {edges.map((e) => {
        const k = edgeKey(e)
        const [text, color] = edgeStatus(e)
        const stateClass =
          k === selectedEdge ? ' selected' : k === hoveredEdge ? ' hovered' : ''
        return (
          <div
            key={k}
            role="row"
            tabIndex={0}
            className={`group-links-row${stateClass}`}
            {...edgeHandlers(e)}
            onKeyDown={(domEvent: KeyboardEvent) => {
              if (domEvent.key === 'Enter' || domEvent.key === ' ') {
                domEvent.preventDefault()
                onSelect(k)
              }
            }}
          >
            <span role="cell">
              <span className="group-links-pair">
                <i style={{ background: colors[e.a] }} />
                {e.a}
                <b>+</b>
                <i style={{ background: colors[e.b] }} />
                {e.b}
              </span>
              <small>
                {e.shared_events}{' '}
                {e.shared_events === 1 ? 'RO em comum' : 'ROs em comum'}
              </small>
            </span>
            <span role="cell" className="num">
              {e.together_at_fact}
            </span>
            <span role="cell" className="num">
              {e.disconnected_together}
            </span>
            <span role="cell" className="num">
              {e.days_together_outside_facts}
            </span>
            <span role="cell">
              <span className="group-links-status" style={{ color }}>
                {text}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
