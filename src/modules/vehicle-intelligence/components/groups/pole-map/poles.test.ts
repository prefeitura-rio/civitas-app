import {
  buildPoles,
  hourRange,
} from '@/modules/vehicle-intelligence/components/groups/pole-map/poles'
import type { GroupPoint } from '@/modules/vehicle-intelligence/types/groups'

const point = (overrides: Partial<GroupPoint>): GroupPoint => ({
  plate: 'AAA1A11',
  event_id: '1',
  kind: 'departure',
  camera_id: 'c1',
  latitude: -22.9,
  longitude: -43.2,
  location: 'Av. Brasil',
  neighborhood: null,
  at: '2026-08-01T07:15:00-03:00',
  territory: null,
  complex: 'Maré',
  faction: 'Comando Vermelho',
  distance_meters: 300,
  elapsed_hours: null,
  ...overrides,
})

describe('mapa de polos', () => {
  it('agrupa as leituras por tipo e câmera, do polo com mais leituras para o com menos', () => {
    const points = [
      point({ event_id: '1' }),
      point({
        event_id: '2',
        plate: 'BBB2B22',
        at: '2026-08-02T09:40:00-03:00',
      }),
      point({
        event_id: '2',
        camera_id: 'c2',
        location: 'Rua A',
        distance_meters: 900,
      }),
      point({ event_id: '3', kind: 'disconnection' }),
      point({ event_id: '4', plate: 'ZZZ9Z99' }),
    ]
    const poles = buildPoles(points, new Set(['AAA1A11', 'BBB2B22']), [
      'departure',
    ])
    expect(poles.map((pole) => [pole.id, pole.count, pole.total])).toEqual([
      ['departure|c1', 2, 3],
      ['departure|c2', 1, 3],
    ])
    expect(poles[0].plates).toEqual([
      ['AAA1A11', 1],
      ['BBB2B22', 1],
    ])
    expect(poles[0].events).toEqual(['1', '2'])
    expect(poles[0].hours).toEqual([7, 9])
    // Longe do complexo (mais de 500 m), o polo fica fora de território.
    expect([poles[0].complex, poles[1].complex]).toEqual(['Maré', null])
  })

  it('escreve a faixa de horas', () => {
    expect(hourRange([])).toBe('sem horário')
    expect(hourRange([7, 7])).toBe('às 07h')
    expect(hourRange([9, 6, 21])).toBe('entre 06h e 21h')
  })
})
