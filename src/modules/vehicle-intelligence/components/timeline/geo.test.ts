import {
  detectionPoint,
  straightDistanceKm,
} from '@/modules/vehicle-intelligence/components/timeline/geo'
import { lighten } from '@/modules/vehicle-intelligence/components/timeline/palette'
import type { Detection } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'

describe('geo', () => {
  it('detectionPoint devolve [lat, lng]', () => {
    expect(
      detectionPoint({ latitude: -22.9, longitude: -43.2 } as Detection),
    ).toEqual([-22.9, -43.2])
  })

  it('straightDistanceKm: um grau de longitude no equador tem ~111 km; o mesmo ponto, 0', () => {
    expect(
      straightDistanceKm(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
      ),
    ).toBeCloseTo(111.19, 2)
    expect(
      straightDistanceKm(
        { latitude: -22.9, longitude: -43.2 },
        { latitude: -22.9, longitude: -43.2 },
      ),
    ).toBe(0)
  })
})

describe('palette', () => {
  it('lighten mistura a cor com branco (45% por padrão)', () => {
    expect(lighten('#000000')).toBe('#737373')
    expect(lighten('#ffffff')).toBe('#ffffff')
    expect(lighten('#c92f48', 0)).toBe('#c92f48')
    expect(lighten('#c92f48', 1)).toBe('#ffffff')
  })
})
