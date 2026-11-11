import {
  describeEdge,
  linkWeight,
} from '@/modules/vehicle-intelligence/components/groups/group-text'
import {
  PARTNER_COLOR,
  SEED_COLOR,
} from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import { useIsInCerco } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type {
  GroupEdge,
  GroupMember,
} from '@/modules/vehicle-intelligence/types/groups'

interface GraphNode {
  member: GroupMember
  x: number
  y: number
  /** Posição e âncora do rótulo, para fora do círculo. */
  lx: number
  ly: number
  anchor: 'start' | 'middle' | 'end'
}

// Medidas do mini-grafo do cartão da página de grupos.
const WIDTH = 280
const HEIGHT = 150
const RADIUS = 9
const LABEL_SIZE = 9.5
const BACKGROUND = '#111616'

/**
 * Mini-grafo do cartão da página de grupos: as placas em órbita e as ligações fortes em linha cheia (mais grossa quanto
 * mais passagens juntas no fato). Semente ciano, parceira cinza; anel vermelho = Cerco; anel rosa tracejado = citada no
 * relato. O rótulo fica para fora do círculo, do lado oposto ao centro. (O perfil do grupo usa `group-links.tsx`.)
 */
export function GroupGraph({
  members,
  edges,
}: {
  members: GroupMember[]
  edges: GroupEdge[]
}) {
  const isInCerco = useIsInCerco()
  const cx = WIDTH / 2
  const cy = HEIGHT / 2 - 6
  const orbit = Math.min(WIDTH, HEIGHT) / 2 - 28
  const nodes = new Map<string, GraphNode>(
    members.map((member, index) => {
      let x = cx
      let y = cy
      if (members.length === 2) x = cx + (index === 0 ? -1 : 1) * orbit * 1.1
      else if (members.length > 2) {
        const angle = -Math.PI / 2 + (2 * Math.PI * index) / members.length
        x = cx + orbit * 1.25 * Math.cos(angle)
        y = cy + orbit * Math.sin(angle)
      }
      const angle =
        members.length === 1 ? Math.PI / 2 : Math.atan2(y - cy, x - cx)
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const gap = RADIUS + 5
      // Em cima a base do texto encosta no nó; embaixo o topo; dos lados fica centrado na altura do nó.
      const baseline =
        sin < -0.35 ? 0 : sin > 0.35 ? LABEL_SIZE * 0.8 : LABEL_SIZE * 0.35
      return [
        member.plate,
        {
          member,
          x,
          y,
          lx: x + cos * gap,
          ly: y + sin * gap + baseline,
          anchor: cos > 0.35 ? 'start' : cos < -0.35 ? 'end' : 'middle',
        },
      ]
    }),
  )
  const strong = edges.filter(
    (edge) => edge.strong && nodes.has(edge.a) && nodes.has(edge.b),
  )
  return (
    <svg
      className="group-graph"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`${members.length} placas e ${strong.length} ${strong.length === 1 ? 'ligação forte' : 'ligações fortes'}: ${members.map((m) => m.plate).join(', ')}`}
    >
      {strong.map((edge) => {
        const a = nodes.get(edge.a)!
        const b = nodes.get(edge.b)!
        return (
          <line
            key={`${edge.a}-${edge.b}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            strokeLinecap="round"
            stroke="#20d6ff"
            strokeOpacity={0.75}
            strokeWidth={Math.min(1.5 + linkWeight(edge) * 0.7, 7)}
          >
            <title>{describeEdge(edge)}</title>
          </line>
        )
      })}
      {[...nodes.values()].map(({ member, x, y, lx, ly, anchor }) => {
        const cerco = isInCerco(member.plate)
        return (
          <g key={member.plate}>
            <title>{`${member.plate}${member.seed ? ` · semente (${member.coverage_rank}ª em Dias de circulação)` : ' · parceira'} · ${formatNumber(member.linked_events)} ocorrências`}</title>
            {cerco && (
              <circle
                cx={x}
                cy={y}
                r={RADIUS + 3.5}
                fill="none"
                stroke="#f04438"
                strokeWidth={2.5}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={RADIUS}
              fill={member.seed ? SEED_COLOR : PARTNER_COLOR}
              stroke={BACKGROUND}
              strokeWidth={2}
            />
            {member.cited && (
              <circle
                cx={x}
                cy={y}
                r={RADIUS + (cerco ? 8 : 4.5)}
                fill="none"
                stroke="#e58fa8"
                strokeWidth={1.6}
                strokeDasharray="2.6 2"
              />
            )}
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              className="group-graph-label"
              fill="#9fb4ba"
              stroke={BACKGROUND}
              fontSize={LABEL_SIZE}
            >
              {member.plate}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
