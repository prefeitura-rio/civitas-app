import type { MasterPreData } from '@/modules/vehicle-intelligence/types/domain'

export const DEFAULT_VISIBLE_ROS = 400
export const VISIBLE_RO_OPTIONS = [50, 100, 200, 400] as const
const MAX_VISIBLE_EDGES = 1600

/** O que o grafo desenha: o desenho base mais as ligações buscadas para as placas selecionadas. */
export type GraphData = Pick<
  MasterPreData,
  'graph' | 'candidates' | 'methodology' | 'authorship_plate_citations'
>

type Graph = MasterPreData['graph']

/** Limita apenas o desenho. Ranking e métricas continuam usando todo o recorte. */
export function graphDisplay(
  graph: Graph,
  roLimit: number,
  selected: ReadonlySet<string>,
) {
  const events = new Map<
    string,
    {
      id: string
      plates: Set<string>
      strength: number
      readings: number
      selected: boolean
    }
  >()
  for (const edge of graph.edges) {
    const event = events.get(edge.source) ?? {
      id: edge.source,
      plates: new Set<string>(),
      strength: 0,
      readings: 0,
      selected: false,
    }
    event.plates.add(edge.target)
    event.strength = Math.max(event.strength, edge.correlation_strength ?? 0)
    event.readings += edge.weight
    event.selected ||= selected.has(edge.source) || selected.has(edge.target)
    events.set(edge.source, event)
  }
  // Preserva as seleções e privilegia ROs que conectam mais de uma placa exibida.
  const eventIds = new Set(
    [...events.values()]
      .sort(
        (left, right) =>
          Number(right.selected) - Number(left.selected) ||
          right.plates.size - left.plates.size ||
          right.strength - left.strength ||
          right.readings - left.readings ||
          left.id.localeCompare(right.id),
      )
      .slice(0, Math.max(1, Math.min(roLimit, 400)))
      .map((event) => event.id),
  )
  const eligibleEdges = graph.edges.filter((edge) => eventIds.has(edge.source))
  let edges = eligibleEdges
  if (eligibleEdges.length > MAX_VISIBLE_EDGES) {
    const ordered = [...eligibleEdges].sort(
      (left, right) =>
        Number(selected.has(right.source) || selected.has(right.target)) -
          Number(selected.has(left.source) || selected.has(left.target)) ||
        (right.correlation_strength ?? 0) - (left.correlation_strength ?? 0) ||
        right.weight - left.weight ||
        left.source.localeCompare(right.source) ||
        left.target.localeCompare(right.target),
    )
    // Mantém uma ligação por RO e por placa antes de preencher as demais:
    // o limite de linhas não pode eliminar os 400 ROs escolhidos.
    const coveredEvents = new Set<string>()
    const coveredPlates = new Set<string>()
    const retained = new Set<Graph['edges'][number]>()
    for (const edge of ordered) {
      if (!coveredEvents.has(edge.source) || !coveredPlates.has(edge.target)) {
        retained.add(edge)
        coveredEvents.add(edge.source)
        coveredPlates.add(edge.target)
      }
    }
    for (const edge of ordered) {
      if (retained.size >= MAX_VISIBLE_EDGES) break
      retained.add(edge)
    }
    edges = ordered.filter((edge) => retained.has(edge))
  }
  const nodeIds = new Set(edges.flatMap((edge) => [edge.source, edge.target]))
  // As placas escolhidas aparecem enquanto suas ligações são buscadas.
  graph.nodes.forEach((node) => {
    if (selected.has(node.id)) nodeIds.add(node.id)
  })
  const visibleEvents = new Set(edges.map((edge) => edge.source))
  return {
    nodes: graph.nodes.filter((node) => nodeIds.has(node.id)),
    edges,
    nodeIds,
    visibleEvents: visibleEvents.size,
    totalEvents: graph.total_events ?? events.size,
    hiddenEdges: (graph.total_edges ?? graph.edges.length) - edges.length,
  }
}

/** O recorte do grafo que o desenho mostra (nós, ligações e as contagens do resumo). */
export type GraphDisplay = ReturnType<typeof graphDisplay>
