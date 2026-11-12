/**
 * Ligações do perfil do grupo (redesign de 14/10, design_handoff_grupos 2.5): o grafo interativo e a lista de pares, com
 * a mesma altura. No grafo, as placas ficam num layout de força (ligações fortes puxam mais) e podem ser arrastadas; o
 * mouse numa placa ou ligação apaga o que não é vizinho; o clique (também na linha da lista) abre a evidência num balão.
 */
import { type PointerEvent, useEffect, useMemo, useRef, useState } from 'react'

import { linkWeight } from '@/modules/vehicle-intelligence/components/groups/group-text'
import { useIsInCerco } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import {
  edgeKey,
  forceLayout,
  HEIGHT,
  type Positions,
  type Target,
} from '@/modules/vehicle-intelligence/features/groups/components/links/link-layout'
import {
  LinkPopover,
  linkPopover,
} from '@/modules/vehicle-intelligence/features/groups/components/links/link-popover'
import { PairsList } from '@/modules/vehicle-intelligence/features/groups/components/links/pairs-list'
import type {
  GroupEdge,
  GroupMember,
} from '@/modules/vehicle-intelligence/types/groups'

export function GroupLinks({
  members,
  edges,
  colors,
}: {
  members: GroupMember[]
  edges: GroupEdge[]
  colors: Record<string, string>
}) {
  const isInCerco = useIsInCerco()
  const container = useRef<HTMLDivElement>(null)
  const drag = useRef<{
    plate: string
    x0: number
    y0: number
    moved: boolean
  } | null>(null)
  const [width, setWidth] = useState(640)
  const [dragged, setDragged] = useState<Positions>({})
  const [selection, setSelection] = useState<Target>(null)
  const [hover, setHover] = useState<Target>(null)
  useEffect(() => {
    const el = container.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width)
      if (w) setWidth(w)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const base = useMemo(() => forceLayout(members, edges), [members, edges])
  const pos = { ...base, ...dragged }
  // Fortes primeiro, depois pelas passagens juntas no fato e pelos ROs em comum; no desenho, as fortes por cima.
  const sortedEdges = useMemo(
    () =>
      [...edges].sort(
        (x, y) =>
          Number(y.strong) - Number(x.strong) ||
          y.together_at_fact - x.together_at_fact ||
          y.shared_events - x.shared_events,
      ),
    [edges],
  )
  const W = width
  const selectedEdge = selection?.kind === 'edge' ? selection.id : null
  const selectedPlate = selection?.kind === 'plate' ? selection.id : null
  const hoveredEdge = hover?.kind === 'edge' ? hover.id : null
  const focused = hover?.kind === 'plate' ? hover.id : selectedPlate
  // Com uma placa em foco, as que não são vizinhas dela ficam apagadas.
  const neighbors = focused
    ? new Set(
        edges.flatMap((e) =>
          e.a === focused ? [e.b] : e.b === focused ? [e.a] : [],
        ),
      )
    : null
  const isDimmed = (plate: string) =>
    Boolean(neighbors && plate !== focused && !neighbors.has(plate))
  const edgeHandlers = (e: GroupEdge) => ({
    onClick: (domEvent: { stopPropagation: () => void }) => {
      domEvent.stopPropagation()
      setSelection({ kind: 'edge', id: edgeKey(e) })
    },
    onMouseEnter: () => setHover({ kind: 'edge', id: edgeKey(e) }),
    onMouseLeave: () => setHover(null),
  })

  const moveDragged = (domEvent: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const el = container.current
    if (!d || !el) return
    if (
      Math.abs(domEvent.clientX - d.x0) + Math.abs(domEvent.clientY - d.y0) >
      3
    )
      d.moved = true
    if (!d.moved) return
    const r = el.getBoundingClientRect()
    const x = Math.min(
      0.95,
      Math.max(0.05, (domEvent.clientX - r.left) / r.width),
    )
    const y = Math.min(
      0.92,
      Math.max(0.07, (domEvent.clientY - r.top) / r.height),
    )
    setDragged((current) => ({ ...current, [d.plate]: { x, y } }))
  }
  const release = () => {
    const d = drag.current
    drag.current = null
    if (d && !d.moved) setSelection({ kind: 'plate', id: d.plate })
  }

  const popover = linkPopover({
    selectedEdge,
    selectedPlate,
    members,
    edges,
    pos,
    width: W,
    isInCerco,
  })

  return (
    <div className="group-links">
      <div
        ref={container}
        className="group-links-graph"
        onPointerMove={moveDragged}
        onPointerUp={release}
        onPointerLeave={release}
      >
        <svg
          width={W}
          height={HEIGHT}
          viewBox={`0 0 ${W} ${HEIGHT}`}
          role="img"
          aria-label={`${members.length} placas e ${edges.filter((e) => e.strong).length} ligações fortes; clique numa placa ou ligação para ver a evidência`}
        >
          <rect
            x={0}
            y={0}
            width={W}
            height={HEIGHT}
            fill="transparent"
            onClick={() => setSelection(null)}
          />
          {[...sortedEdges].reverse().map((e) => {
            const a = pos[e.a]
            const b = pos[e.b]
            if (!a || !b) return null
            const k = edgeKey(e)
            const active = k === selectedEdge || k === hoveredEdge
            const touchesFocus = !focused || e.a === focused || e.b === focused
            return (
              <g key={k}>
                <line
                  x1={a.x * W}
                  y1={a.y * HEIGHT}
                  x2={b.x * W}
                  y2={b.y * HEIGHT}
                  strokeLinecap="round"
                  pointerEvents="none"
                  stroke={
                    active
                      ? '#f3f7f8'
                      : e.double_read
                        ? '#e0a458'
                        : e.strong
                          ? '#20d6ff'
                          : '#7d8f94'
                  }
                  strokeWidth={
                    (e.strong ? Math.min(2 + linkWeight(e) * 0.8, 8) : 1.6) +
                    (active ? 1.5 : 0)
                  }
                  strokeDasharray={
                    e.strong ? undefined : e.double_read ? '2 4' : '5 5'
                  }
                  strokeOpacity={
                    selectedEdge && !active
                      ? 0.25
                      : touchesFocus
                        ? e.strong
                          ? 0.85
                          : 0.6
                        : 0.1
                  }
                />
                <line
                  x1={a.x * W}
                  y1={a.y * HEIGHT}
                  x2={b.x * W}
                  y2={b.y * HEIGHT}
                  stroke="transparent"
                  strokeWidth={16}
                  className="group-links-target"
                  {...edgeHandlers(e)}
                />
              </g>
            )
          })}
          {members.map((m) => {
            const p = pos[m.plate]
            const cerco = isInCerco(m.plate)
            return (
              <g
                key={m.plate}
                className="group-links-no"
                opacity={isDimmed(m.plate) ? 0.3 : undefined}
                onPointerDown={(domEvent) => {
                  domEvent.stopPropagation()
                  drag.current = {
                    plate: m.plate,
                    x0: domEvent.clientX,
                    y0: domEvent.clientY,
                    moved: false,
                  }
                }}
                onMouseEnter={() => setHover({ kind: 'plate', id: m.plate })}
                onMouseLeave={() => setHover(null)}
              >
                {selectedPlate === m.plate && (
                  <circle
                    cx={p.x * W}
                    cy={p.y * HEIGHT}
                    r={26}
                    fill="none"
                    stroke="#f3f7f8"
                    strokeWidth={2}
                  />
                )}
                {cerco && (
                  <circle
                    cx={p.x * W}
                    cy={p.y * HEIGHT}
                    r={21}
                    fill="none"
                    stroke="#f04438"
                    strokeWidth={2.5}
                  />
                )}
                <circle
                  cx={p.x * W}
                  cy={p.y * HEIGHT}
                  r={17}
                  fill={colors[m.plate]}
                  stroke="#111616"
                  strokeWidth={2.5}
                />
                {m.cited && (
                  <circle
                    cx={p.x * W}
                    cy={p.y * HEIGHT}
                    r={cerco ? 25 : 21}
                    fill="none"
                    stroke="#e58fa8"
                    strokeWidth={2}
                    strokeDasharray="3.5 2.5"
                  />
                )}
              </g>
            )
          })}
        </svg>
        {members.map((m) => {
          const p = pos[m.plate]
          return (
            <span
              key={m.plate}
              className="group-links-label"
              style={{
                left: p.x * W,
                top: p.y * HEIGHT + (isInCerco(m.plate) || m.cited ? 38 : 32),
                opacity: isDimmed(m.plate) ? 0.3 : 1,
              }}
            >
              {m.plate}
            </span>
          )
        })}
        <div className="group-links-legend" aria-hidden="true">
          <span>
            <i className="strong" />
            Forte
          </span>
          <span>
            <i className="divide" />
            Divide RO
          </span>
          <span>
            <i className="double" />
            Leitura dupla
          </span>
        </div>
        {popover && (
          <LinkPopover
            popover={popover}
            colors={colors}
            onClose={() => setSelection(null)}
          />
        )}
      </div>

      <PairsList
        edges={sortedEdges}
        colors={colors}
        selectedEdge={selectedEdge}
        hoveredEdge={hoveredEdge}
        edgeHandlers={edgeHandlers}
        onSelect={(id) => setSelection({ kind: 'edge', id })}
      />
    </div>
  )
}
