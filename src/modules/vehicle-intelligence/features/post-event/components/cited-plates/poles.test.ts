import {
  cispBreakdownLabel,
  connectionsOfPole,
  explorerViewport,
  type LatLng,
  modalityLabel,
  originPoints,
  poleObstacles,
  trimmedBounds,
} from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/poles'
import type {
  DestinationPole,
  OriginPole,
  OriginPoleEvent,
  PoleConnection,
} from '@/modules/vehicle-intelligence/features/post-event/types'

const event = (fields: Partial<OriginPoleEvent>) =>
  ({
    event_id: '1',
    latitude: -22.9,
    longitude: -43.2,
    address: null,
    plates: [],
    ...fields,
  }) as OriginPoleEvent

describe('rótulos', () => {
  it('modalidade em minúsculas e CISP com o prefixo', () => {
    expect(modalityLabel('ROUBO')).toBe('roubo')
    expect(modalityLabel('FURTO')).toBe('furto')
    expect(modalityLabel('CARGA')).toBe('carga')
    expect(cispBreakdownLabel('014')).toBe('CISP 014')
    expect(cispBreakdownLabel('Não informado')).toBe('Não informado')
  })
})

describe('originPoints', () => {
  it('junta as ocorrências da mesma coordenada, com as placas sem repetição e em ordem', () => {
    const pole = {
      events: [
        event({ event_id: '1', plates: ['BBB2B22'] }),
        event({
          event_id: '2',
          address: 'Rua A, 10',
          plates: ['AAA1A11', 'BBB2B22'],
        }),
        event({ event_id: '3', latitude: -22.8 }),
      ],
    } as OriginPole
    expect(
      originPoints(pole).map(({ key, address, events, plates }) => ({
        key,
        address,
        events: events.length,
        plates,
      })),
    ).toEqual([
      {
        key: '-22.900000:-43.200000',
        address: 'Rua A, 10',
        events: 2,
        plates: ['AAA1A11', 'BBB2B22'],
      },
      {
        key: '-22.800000:-43.200000',
        address: 'Endereço não informado',
        events: 1,
        plates: [],
      },
    ])
  })
})

describe('trimmedBounds', () => {
  it('com menos de 10 pontos, todos', () => {
    const points: LatLng[] = [
      [1, 2],
      [3, 4],
    ]
    expect(trimmedBounds(points)).toBe(points)
  })

  it('com 10 ou mais, os cantos sem os 5% de cada ponta', () => {
    const points = Array.from(
      { length: 20 },
      (_, index) => [index, -index] as LatLng,
    )
    expect(trimmedBounds(points)).toEqual([
      [1, -18],
      [18, -1],
    ])
  })
})

describe('explorador', () => {
  const origin = {
    id: 'o1',
    events: [event({})],
    tracked_occurrences: 1,
    latitude: 1,
    longitude: 2,
  } as OriginPole
  const destination = {
    id: 'd1',
    latitude: 5,
    longitude: 6,
    occurrences: 9,
    radars: [{ latitude: 7, longitude: 8 }],
  } as DestinationPole
  const connection = {
    id: 'c',
    origin_id: 'o1',
    destination_id: 'd1',
    origin_latitude: 1,
    origin_longitude: 2,
    destination_latitude: 5,
    destination_longitude: 6,
  } as PoleConnection

  it('as ligações do polo aberto', () => {
    expect(connectionsOfPole([connection], origin, null)).toEqual([connection])
    expect(
      connectionsOfPole([connection], null, { ...destination, id: 'd2' }),
    ).toEqual([])
    expect(connectionsOfPole([connection], null, null)).toEqual([])
  })

  it('o enquadramento do polo aberto ou da visão geral (só origens com placa citada)', () => {
    const data = {
      origin_poles: [origin, { ...origin, tracked_occurrences: 0 }],
      destination_poles: [destination],
    }
    const points = originPoints(origin)
    expect(
      explorerViewport(data, {
        origin,
        destination: null,
        points,
        connections: [connection],
      }),
    ).toEqual([
      [-22.9, -43.2],
      [5, 6],
    ])
    expect(
      explorerViewport(data, {
        origin: null,
        destination,
        points: [],
        connections: [connection],
      }),
    ).toEqual([
      [7, 8],
      [1, 2],
    ])
    expect(
      explorerViewport(data, {
        origin: null,
        destination: null,
        points: [],
        connections: [],
      }),
    ).toEqual([
      [5, 6],
      [1, 2],
    ])
  })

  it('obstáculos: origens com placa citada maiores; desconexões pela própria escala', () => {
    const obstacles = poleObstacles(
      [
        { ...origin, occurrences: 4 },
        { ...origin, occurrences: 4, tracked_occurrences: 0 },
      ],
      [destination],
      16,
      9,
    )
    expect(obstacles.map((item) => item.radius)).toEqual([14, 12, 25])
  })
})
