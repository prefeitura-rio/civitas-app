import {
  categoryCountsLine,
  isRecurringConnection,
  originClusterPoints,
  percentageBreakdown,
  topCispItems,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import type {
  ClusterConnection,
  OriginCluster,
  PostEventOrigin,
} from '@/modules/vehicle-intelligence/features/post-event/types'

// Nos testes o recorte é o padrão (transeuntes): as modalidades de origem são ROUBO e FURTO.

const origin = (fields: Partial<PostEventOrigin>) =>
  ({
    event_id: '1',
    plate: 'AAA1A11',
    cisp: '014',
    event_latitude: -22.9,
    event_longitude: -43.2,
    ...fields,
  }) as PostEventOrigin

describe('isRecurringConnection', () => {
  it('liga polos com 2 ou mais ocorrências em comum', () => {
    expect(isRecurringConnection({ occurrences: 1 } as ClusterConnection)).toBe(
      false,
    )
    expect(isRecurringConnection({ occurrences: 2 } as ClusterConnection)).toBe(
      true,
    )
  })
})

describe('percentageBreakdown', () => {
  it('conta cada valor em porcentagem com uma casa, vazio como Não informado, do maior para o menor', () => {
    expect(
      percentageBreakdown(['014', '014', ' ', null, '012', '012', '012']),
    ).toEqual([
      { key: '012', label: '012', percentage: 42.9 },
      { key: '014', label: '014', percentage: 28.6 },
      { key: 'Não informado', label: 'Não informado', percentage: 28.6 },
    ])
  })

  it('lista vazia não divide por zero', () => {
    expect(percentageBreakdown([])).toEqual([])
  })
})

describe('topCispItems', () => {
  it('corta no limite e põe CISP antes do código, menos no Não informado', () => {
    const items = percentageBreakdown(['014', '014', null, '012'])
    expect(topCispItems(items, 2).map((item) => item.label)).toEqual([
      'CISP 014',
      'CISP 012',
    ])
    expect(topCispItems(items, 5).map((item) => item.label)).toEqual([
      'CISP 014',
      'CISP 012',
      'Não informado',
    ])
  })
})

describe('originClusterPoints', () => {
  it('junta as ocorrências da mesma coordenada e ignora as sem coordenada', () => {
    const cluster = {
      events: [
        origin({
          event_id: '1',
          plate: 'AAA1A11',
          cisp: '014',
          event_address: null,
        }),
        origin({
          event_id: '2',
          plate: 'BBB2B22',
          cisp: '015',
          event_address: 'Rua A, 10',
        }),
        origin({
          event_id: '3',
          plate: 'AAA1A11',
          cisp: '014',
          event_latitude: -22.8,
          event_address: 'Rua B, 5',
        }),
        origin({ event_id: '4', event_latitude: null }),
      ],
    } as OriginCluster
    const points = originClusterPoints(cluster)
    expect(
      points.map(({ key, address, occurrences, vehicles, cispCount }) => ({
        key,
        address,
        occurrences,
        vehicles,
        cispCount,
      })),
    ).toEqual([
      {
        key: '-22.900000:-43.200000',
        address: 'Rua A, 10',
        occurrences: 2,
        vehicles: 2,
        cispCount: 2,
      },
      {
        key: '-22.800000:-43.200000',
        address: 'Rua B, 5',
        occurrences: 1,
        vehicles: 1,
        cispCount: 1,
      },
    ])
  })

  it('sem endereço em nenhuma ocorrência, avisa', () => {
    const points = originClusterPoints({
      events: [origin({ event_address: null })],
    } as OriginCluster)
    expect(points[0].address).toBe('Endereço não informado')
  })
})

describe('categoryCountsLine', () => {
  it('só existe quando o motor conta as categorias (carga)', () => {
    expect(categoryCountsLine(undefined)).toBeNull()
    expect(categoryCountsLine({ ROUBO: 3 })).toBe('3 roubo · 0 furto')
  })
})
