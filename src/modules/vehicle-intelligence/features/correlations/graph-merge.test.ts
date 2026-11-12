/* eslint-disable camelcase -- campos da API em snake_case */
import type { GraphData } from '@/modules/vehicle-intelligence/features/correlations/graph-display'
import {
  EMPTY_GRAPH,
  mergeGraphs,
} from '@/modules/vehicle-intelligence/features/correlations/graph-merge'

type Node = GraphData['graph']['nodes'][number]
type Edge = GraphData['graph']['edges'][number]
type Candidate = GraphData['candidates'][number]

const node = (id: string, kind: Node['kind'] = 'candidate') =>
  ({ id, label: id, kind }) as Node
const edge = (source: string, target: string, weight = 1) =>
  ({ source, target, weight }) as Edge
const candidate = (plate: string, linked_events = 1) =>
  ({ plate, linked_events }) as Candidate

const BASE: GraphData = {
  graph: {
    nodes: [node('RO1', 'event'), node('ABC1D23')],
    edges: [edge('RO1', 'ABC1D23', 3)],
  },
  candidates: [candidate('ABC1D23', 4)],
  methodology: {},
}

describe('grafo com as placas selecionadas', () => {
  it('sem extras nem placas a esperar, devolve o próprio grafo', () => {
    expect(mergeGraphs(BASE, [], ['ABC1D23'])).toBe(BASE)
  })

  it('soma nós, ligações e correlatas buscados, e o desenho base prevalece', () => {
    const extra: GraphData = {
      graph: {
        nodes: [node('RO2', 'event'), node('ABC1D23'), node('XYZ9K87')],
        edges: [edge('RO1', 'ABC1D23', 9), edge('RO2', 'XYZ9K87')],
      },
      candidates: [candidate('ABC1D23', 99), candidate('XYZ9K87')],
      methodology: {},
    }
    const merged = mergeGraphs(BASE, [extra], [])
    expect(merged.graph.nodes.map((item) => item.id).sort()).toEqual([
      'ABC1D23',
      'RO1',
      'RO2',
      'XYZ9K87',
    ])
    expect(
      merged.graph.edges.find((item) => item.target === 'ABC1D23')?.weight,
    ).toBe(3)
    expect(
      merged.candidates.find((item) => item.plate === 'ABC1D23')?.linked_events,
    ).toBe(4)
    expect(merged.graph.edges).toHaveLength(2)
  })

  it('põe um nó provisório para a placa escolhida no ranking ainda sem ligações', () => {
    const merged = mergeGraphs(EMPTY_GRAPH, [], ['QWE4R56'])
    expect(merged.graph.nodes).toEqual([
      { id: 'QWE4R56', label: 'QWE4R56', kind: 'candidate' },
    ])
  })
})
