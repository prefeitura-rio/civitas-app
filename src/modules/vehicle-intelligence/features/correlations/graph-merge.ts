import type { GraphData } from '@/modules/vehicle-intelligence/features/correlations/graph-display'

export const EMPTY_GRAPH: GraphData = {
  graph: { nodes: [], edges: [] },
  candidates: [],
  methodology: {},
}

/** Soma ao grafo desenhado as ligações buscadas para as placas selecionadas; o desenho base prevalece. */
export function mergeGraphs(
  base: GraphData,
  extras: GraphData[],
  placeholders: string[],
): GraphData {
  const missing = placeholders.filter(
    (plate) => !base.graph.nodes.some((node) => node.id === plate),
  )
  if (!extras.length && !missing.length) return base
  const nodes = new Map(
    [...extras.flatMap((item) => item.graph.nodes), ...base.graph.nodes].map(
      (node) => [node.id, node],
    ),
  )
  missing.forEach((plate) => {
    if (!nodes.has(plate))
      nodes.set(plate, { id: plate, label: plate, kind: 'candidate' })
  })
  const candidates = new Map(
    [...extras.flatMap((item) => item.candidates), ...base.candidates].map(
      (candidate) => [candidate.plate, candidate],
    ),
  )
  const edges = new Map(
    [...extras.flatMap((item) => item.graph.edges), ...base.graph.edges].map(
      (edge) => [`${edge.source}:${edge.target}`, edge],
    ),
  )
  return {
    ...base,
    candidates: [...candidates.values()],
    graph: {
      ...base.graph,
      nodes: [...nodes.values()],
      edges: [...edges.values()],
    },
  }
}
