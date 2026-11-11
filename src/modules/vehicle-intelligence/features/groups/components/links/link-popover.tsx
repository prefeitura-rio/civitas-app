import {
  describeChance,
  memberRole,
} from '@/modules/vehicle-intelligence/components/groups/group-text'
import {
  edgeKey,
  edgeStatus,
  HEIGHT,
  type Positions,
} from '@/modules/vehicle-intelligence/features/groups/components/links/link-layout'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type {
  GroupEdge,
  GroupMember,
} from '@/modules/vehicle-intelligence/types/groups'

/** O balão da evidência: as placas, a situação, os números e a nota. */
export interface LinkPopoverContent {
  style: { left: number; top: number; transform: string }
  plates: string[]
  label: string
  color: string
  numbers: Array<[number | string, string]>
  note: string
}

/** O balão do par ou da placa selecionada (nenhum sem seleção), na posição dela no grafo de largura `width`. */
export function linkPopover({
  selectedEdge,
  selectedPlate,
  members,
  edges,
  pos,
  width,
  isInCerco,
}: {
  selectedEdge: string | null
  selectedPlate: string | null
  members: GroupMember[]
  edges: GroupEdge[]
  pos: Positions
  width: number
  isInCerco: (plate: string) => boolean
}): LinkPopoverContent | null {
  const W = width
  // Balão: no meio da aresta ou no nó; abaixo dele, ou acima se o ponto está na metade de baixo; preso às bordas.
  const anchor = (x: number, y: number, dy: number) => ({
    left: Math.min(Math.max(x, 155), W - 155),
    top: y,
    transform:
      y > 240
        ? `translate(-50%, calc(-100% - ${dy}px))`
        : `translate(-50%, ${dy}px)`,
  })
  const pair = selectedEdge
    ? edges.find((e) => edgeKey(e) === selectedEdge)
    : undefined
  const member = selectedPlate
    ? members.find((m) => m.plate === selectedPlate)
    : undefined
  let popover: LinkPopoverContent | null = null
  if (pair) {
    const [text, color] = edgeStatus(pair)
    popover = {
      style: anchor(
        ((pos[pair.a].x + pos[pair.b].x) / 2) * W,
        ((pos[pair.a].y + pos[pair.b].y) / 2) * HEIGHT,
        14,
      ),
      plates: [pair.a, pair.b],
      label: pair.strong
        ? 'Ligação forte'
        : text === 'Fraca'
          ? 'Ligação fraca'
          : text,
      color,
      numbers: [
        [
          pair.shared_events,
          pair.shared_events === 1 ? 'RO em comum' : 'ROs em comum',
        ],
        [pair.together_at_fact, 'juntas no fato'],
        [pair.disconnected_together, 'desconectaram juntas'],
        [pair.days_together_outside_facts, 'dias juntas fora dos fatos'],
      ],
      note: [
        pair.chance != null &&
          pair.chance < 1 &&
          `Chance de ser ${describeChance(pair.chance)}.`,
        pair.double_read && 'Placas a 1 caractere: provável leitura dupla.',
        pair.routine && 'Andam juntas também fora dos fatos (rotina).',
      ]
        .filter(Boolean)
        .join(' '),
    }
  } else if (member) {
    const memberEdges = edges.filter(
      (e) => e.a === member.plate || e.b === member.plate,
    )
    popover = {
      style: anchor(pos[member.plate].x * W, pos[member.plate].y * HEIGHT, 30),
      plates: [member.plate],
      label: memberRole(member),
      color: '#dfe7ea',
      numbers: [
        [formatNumber(member.linked_events), 'ocorrências'],
        [memberEdges.filter((e) => e.strong).length, 'ligações fortes'],
        [memberEdges.length, 'pares no grupo'],
        [formatNumber(member.circulation_days), 'dias ativos'],
      ],
      note: [
        isInCerco(member.plate) && 'Monitorada hoje no Cerco Digital.',
        member.cited && 'Citada no relato como veículo do autor ou de apoio.',
      ]
        .filter(Boolean)
        .join(' '),
    }
  }
  return popover
}

export function LinkPopover({
  popover,
  colors,
  onClose,
}: {
  popover: LinkPopoverContent
  colors: Record<string, string>
  onClose: () => void
}) {
  return (
    <div
      className="group-links-bubble"
      style={popover.style}
      role="dialog"
      aria-label="Evidência"
    >
      <div className="group-links-bubble-top">
        {popover.plates.map((plate) => (
          <span key={plate}>
            <i style={{ background: colors[plate] }} />
            {plate}
          </span>
        ))}
        <button type="button" aria-label="Fechar" onClick={onClose}>
          ×
        </button>
      </div>
      <span
        className="group-links-bubble-label"
        style={{ color: popover.color }}
      >
        {popover.label}
      </span>
      <div className="group-links-bubble-numbers">
        {popover.numbers.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <small>{label}</small>
          </div>
        ))}
      </div>
      {popover.note && <p>{popover.note}</p>}
    </div>
  )
}
