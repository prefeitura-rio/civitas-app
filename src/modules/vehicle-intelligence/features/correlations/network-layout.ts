/** Regras puras do desenho da rede (vis-network): cores das ligações, posições iniciais, assinatura e enquadramento. */
import type { GraphEdge } from '@/modules/vehicle-intelligence/features/correlations/graph-variants'

type Point = { x: number; y: number }

export function strengthColor(strength: number): string {
  if (strength >= 70) return 'rgba(255,82,102,.88)'
  if (strength >= 40) return 'rgba(24,199,221,.62)'
  return 'rgba(159,180,186,.22)'
}

export const ANCHOR_NODE_SIZE = 10
export const LAYOUT_ITERATIONS = 360
export const LAYOUT_TIME_LIMIT_MS = 2500

function stableAngle(id: string): number {
  let hash = 0
  for (const character of id)
    hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0
  return ((Math.abs(hash) % 3600) / 3600) * Math.PI * 2
}

/** Posições iniciais em espiral, numa ordem estável pelo id. A posição não separa tipos: a física aproxima os ligados. */
export function spiralPositions(
  nodes: Array<{ id: string }>,
): Map<string, Point> {
  return new Map(
    nodes
      .slice()
      .sort(
        (left, right) =>
          stableAngle(left.id) - stableAngle(right.id) ||
          left.id.localeCompare(right.id),
      )
      .map((item, index) => {
        const angle = index * 2.399963229728653
        const radius = 70 + Math.sqrt(index) * 45
        return [
          item.id,
          { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius },
        ]
      }),
  )
}

/** Assinatura do desenho (chave da consulta, nós e ligações visíveis): o layout guardado vale só para ela. */
export function graphFingerprint(
  stateKey: string,
  nodes: Array<{ id: string }>,
  edges: GraphEdge[],
): string {
  let hash = 2166136261
  const add = (value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index)
      hash = Math.imul(hash, 16777619)
    }
  }
  add(stateKey)
  nodes
    .map((node) => node.id)
    .sort()
    .forEach(add)
  edges
    .map((edge) => `${edge.source}:${edge.target}:${edge.weight}`)
    .sort()
    .forEach(add)
  return `graph-v4:${nodes.length}:${edges.length}:${hash >>> 0}`
}

/**
 * Enquadramento dos nós destacados: a caixa que os contém e a escala que cabe na área livre do grafo (descontado o
 * inspetor), até 0,8.
 */
export function focusFrame(
  points: Point[],
  width: number,
  height: number,
  reservedWidth: number,
  reservedHeight: number,
): {
  bounds: { left: number; right: number; top: number; bottom: number }
  scale: number
} {
  const bounds = {
    left: Math.min(...points.map((point) => point.x)),
    right: Math.max(...points.map((point) => point.x)),
    top: Math.min(...points.map((point) => point.y)),
    bottom: Math.max(...points.map((point) => point.y)),
  }
  const scale = Math.max(
    0.001,
    Math.min(
      0.8,
      Math.max(40, width - reservedWidth - 140) /
        Math.max(1, bounds.right - bounds.left),
      Math.max(40, height - reservedHeight - 120) /
        Math.max(1, bounds.bottom - bounds.top),
    ),
  )
  return { bounds, scale }
}
