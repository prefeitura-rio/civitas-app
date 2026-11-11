/** O grafo das ligações: posições do layout de força, a chave e a situação de cada par. */
import { linkWeight } from '@/modules/vehicle-intelligence/components/groups/group-text'
import type {
  GroupEdge,
  GroupMember,
} from '@/modules/vehicle-intelligence/types/groups'

/** Altura do grafo (px); a largura acompanha a caixa. */
export const HEIGHT = 460
export type Positions = Record<string, { x: number; y: number }>
export type Target = { kind: 'edge' | 'plate'; id: string } | null

export const edgeKey = (e: GroupEdge) => `${e.a}|${e.b}`

/** Situação do par em texto colorido: forte, leitura dupla, rotina ou fraca. */
export const edgeStatus = (e: GroupEdge): [string, string] =>
  e.strong
    ? ['Forte', '#20d6ff']
    : e.double_read
      ? ['Leitura dupla', '#e0a458']
      : e.routine
        ? ['Rotina', '#e0a458']
        : ['Fraca', '#9fb4ba']

/** Layout de força (Fruchterman-Reingold), determinístico: começa num círculo e as ligações fortes puxam mais. Coordenadas de 0 a 1. */
export function forceLayout(
  members: GroupMember[],
  edges: GroupEdge[],
): Positions {
  const n = members.length
  // Com 2 placas, o par começa na horizontal (o grafo é mais largo que alto).
  const P = members.map((_, i) => {
    const a = n === 2 ? Math.PI * i : -Math.PI / 2 + (2 * Math.PI * i) / n
    return { x: 0.5 + 0.3 * Math.cos(a), y: 0.5 + 0.3 * Math.sin(a) }
  })
  const indexByPlate = new Map(members.map((m, i) => [m.plate, i]))
  const k = Math.min(0.42, 0.9 / Math.sqrt(n))
  for (let it = 0; it < 320; it += 1) {
    const t = 0.06 * (1 - it / 320) + 0.002
    const D = P.map(() => ({ x: 0, y: 0 }))
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const dx = P[i].x - P[j].x
        const dy = P[i].y - P[j].y
        const d = Math.max(0.01, Math.hypot(dx, dy))
        const f = (k * k) / d
        D[i].x += (dx / d) * f
        D[i].y += (dy / d) * f
        D[j].x -= (dx / d) * f
        D[j].y -= (dy / d) * f
      }
    }
    for (const e of edges) {
      const i = indexByPlate.get(e.a)
      const j = indexByPlate.get(e.b)
      if (i == null || j == null) continue
      const dx = P[i].x - P[j].x
      const dy = P[i].y - P[j].y
      const d = Math.max(0.01, Math.hypot(dx, dy))
      const f = ((d * d) / k) * (e.strong ? 1 + linkWeight(e) * 0.25 : 0.35)
      D[i].x -= (dx / d) * f
      D[i].y -= (dy / d) * f
      D[j].x += (dx / d) * f
      D[j].y += (dy / d) * f
    }
    P.forEach((p, i) => {
      D[i].x += (0.5 - p.x) * 0.08
      D[i].y += (0.5 - p.y) * 0.08
      const m = Math.hypot(D[i].x, D[i].y) || 1
      p.x += (D[i].x / m) * Math.min(m, t)
      p.y += (D[i].y / m) * Math.min(m, t)
    })
  }
  const xs = P.map((p) => p.x)
  const ys = P.map((p) => p.y)
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const y0 = Math.min(...ys)
  const y1 = Math.max(...ys)
  // Esticado para a área útil; um eixo sem variação (ex. o par na horizontal) fica no centro.
  return Object.fromEntries(
    members.map((m, i) => [
      m.plate,
      {
        x:
          n === 1 || x1 - x0 < 0.01
            ? 0.5
            : 0.14 + (0.72 * (P[i].x - x0)) / (x1 - x0),
        y:
          n === 1 || y1 - y0 < 0.01
            ? 0.45
            : 0.12 + (0.66 * (P[i].y - y0)) / (y1 - y0),
      },
    ]),
  )
}
