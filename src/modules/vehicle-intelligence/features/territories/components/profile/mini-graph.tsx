import type { TerritoryGroup } from '@/modules/vehicle-intelligence/features/territories/types'

/** Mini-grafo do cartão: os nós numa elipse a partir do topo (2 nós: na horizontal); sinais em anéis, como no grafo do grupo. */
export function MiniGraph({
  group,
  isInCerco,
}: {
  group: TerritoryGroup
  isInCerco: (plate: string) => boolean
}) {
  const W = 360
  const H = 172
  const n = group.members.length
  const withBase = new Set(group.members_with_base)
  const pos = new Map(
    group.members.map((m, i) => {
      const angle = n === 2 ? Math.PI * i : -Math.PI / 2 + (i * 2 * Math.PI) / n
      return [
        m.plate,
        [W / 2 + Math.cos(angle) * 112, H / 2 - 6 + Math.sin(angle) * 46],
      ] as const
    }),
  )
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className="territory-graph"
      aria-hidden="true"
    >
      {group.edges
        .filter((e) => pos.has(e.a) && pos.has(e.b))
        .map((e) => {
          const [x1, y1] = pos.get(e.a)!
          const [x2, y2] = pos.get(e.b)!
          return (
            <line
              key={`${e.a}-${e.b}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={e.strong ? 'rgba(24,199,221,.8)' : '#4f6064'}
              strokeWidth={e.strong ? 2.5 : 1.5}
              strokeDasharray={e.strong ? undefined : '4 4'}
            />
          )
        })}
      {group.members.map((m) => {
        const [x, y] = pos.get(m.plate)!
        const hasBase = withBase.has(m.plate)
        const cerco = isInCerco(m.plate)
        const labelBelow = y >= H / 2 - 6 || n === 2
        return (
          <g key={m.plate}>
            {cerco && (
              <circle
                cx={x}
                cy={y}
                r={11.5}
                fill="none"
                stroke="#f04438"
                strokeWidth={2}
              />
            )}
            {m.cited && (
              <circle
                cx={x}
                cy={y}
                r={cerco ? 15 : 11.5}
                fill="none"
                stroke="#e58fa8"
                strokeWidth={1.5}
                strokeDasharray="3 2.5"
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={7}
              fill={hasBase ? '#18c7dd' : '#121717'}
              stroke={hasBase ? '#121717' : '#5f7479'}
              strokeWidth={hasBase ? 2 : 1.5}
            >
              <title>{`${m.plate}${hasBase ? ' · base aqui' : ' · sem base aqui'}${cerco ? ' · Cerco' : ''}${m.cited ? ' · citada no relato' : ''}`}</title>
            </circle>
            <text
              x={x}
              y={labelBelow ? y + 28 : y - 20}
              textAnchor="middle"
              className="territory-graph-label"
              fill={hasBase ? '#f3f7f8' : '#82979d'}
            >
              {m.plate}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
