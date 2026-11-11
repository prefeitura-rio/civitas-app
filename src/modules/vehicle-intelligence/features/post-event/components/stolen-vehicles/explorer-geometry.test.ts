import {
  connectionsOfSelection,
  destinationPoleCoverage,
  poleMaximumOf,
  poleObstacles,
  viewportPointsOf,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/explorer-geometry'
import { legendParameters } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/legend-parameters'
import type {
  ClusterConnection,
  DestinationCluster,
  LocationHotspot,
  MasterPostData,
  OriginCluster,
  TerminalHub,
} from '@/modules/vehicle-intelligence/features/post-event/types'

const connection = (fields: Partial<ClusterConnection>) =>
  ({
    id: 'c',
    origin_cluster_id: 'o1',
    destination_cluster_id: null,
    destination_hub_id: null,
    origin_latitude: 1,
    origin_longitude: 2,
    destination_latitude: 3,
    destination_longitude: 4,
    occurrences: 2,
    ...fields,
  }) as ClusterConnection

const poles = {
  origin_clusters: [
    { id: 'o1', latitude: 10, longitude: 11, occurrences: 4 } as OriginCluster,
  ],
  destination_clusters: [
    {
      id: 7,
      latitude: 20,
      longitude: 21,
      occurrences: 16,
      destinations: [] as LocationHotspot[],
    } as DestinationCluster,
  ],
  destination_hubs: [
    {
      point_id: 'p9',
      latitude: 30,
      longitude: 31,
      occurrences: 1,
    } as TerminalHub,
  ],
}

describe('connectionsOfSelection', () => {
  const all = [
    connection({ id: 'a', origin_cluster_id: 'o1', destination_cluster_id: 7 }),
    connection({ id: 'b', origin_cluster_id: 'o2', destination_hub_id: 'p9' }),
  ]
  it('filtra pelo polo aberto, na ordem origem, desconexão, terminal', () => {
    expect(
      connectionsOfSelection(all, 'o1', null, null).map((item) => item.id),
    ).toEqual(['a'])
    expect(
      connectionsOfSelection(all, null, 7, null).map((item) => item.id),
    ).toEqual(['a'])
    expect(
      connectionsOfSelection(all, null, null, 'p9').map((item) => item.id),
    ).toEqual(['b'])
  })
  it('sem polo aberto, nenhuma', () => {
    expect(connectionsOfSelection(all, null, null, null)).toEqual([])
  })
})

describe('viewportPointsOf', () => {
  const none = {
    terminal: null,
    originPoints: [],
    destination: null,
    connections: [],
  }
  it('sem polo aberto, enquadra todos os polos', () => {
    expect(viewportPointsOf(poles, none)).toEqual([
      [10, 11],
      [20, 21],
      [30, 31],
    ])
  })
  it('terminal aberto: ele e as origens das conexões', () => {
    const terminal = poles.destination_hubs[0]
    expect(
      viewportPointsOf(poles, {
        ...none,
        terminal,
        connections: [connection({})],
      }),
    ).toEqual([
      [30, 31],
      [1, 2],
    ])
  })
  it('desconexão aberta sem radares: o centro do polo e as origens', () => {
    const destination = poles.destination_clusters[0]
    expect(
      viewportPointsOf(poles, {
        ...none,
        destination,
        connections: [connection({})],
      }),
    ).toEqual([
      [20, 21],
      [1, 2],
    ])
  })
})

describe('escala dos polos', () => {
  it('o maior polo dá a escala; os círculos viram obstáculos para os nomes de território', () => {
    expect(poleMaximumOf(poles)).toBe(16)
    expect(poleObstacles(poles, 16).map((item) => item.radius)).toEqual([
      26, 11, 16,
    ])
  })
})

describe('destinationPoleCoverage', () => {
  it('porcentagem com uma casa das ocorrências que terminam num polo de desconexão', () => {
    const data = {
      ...poles,
      cluster_coverage: {
        destination_events_clustered: 20,
        destination_events_unclustered: 10,
      },
    } as unknown as MasterPostData
    expect(destinationPoleCoverage(data)).toBe(56.7)
  })
})

describe('legendParameters', () => {
  it('usa os parâmetros do motor e cai nos padrões quando faltam', () => {
    const parameters = legendParameters({
      origin_cluster_parameters: {
        ROUBO: { radius_meters: 250, minimum_events: 5 },
      },
      cluster_radius_meters: 500,
    } as unknown as MasterPostData['methodology'])
    expect(parameters).toMatchObject({
      primaryPoleRadius: 250,
      primaryPoleMinimum: 5,
      secondaryPoleRadius: 300,
      secondaryPoleMinimum: 4,
      disconnectionPoleRadius: 500,
      disconnectionPoleMinimum: 3,
      originConcentrationRadius: 75,
    })
  })
})
