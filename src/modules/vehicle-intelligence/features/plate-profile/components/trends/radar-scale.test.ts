import type { CirclePoint } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-map'
import {
  magnitudeBands,
  magnitudeScale,
  tierStyle,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/radar-scale'

const points = (counts: number[]): CirclePoint[] =>
  counts.map((detections, index) => ({
    id: String(index),
    label: '',
    detections,
    latitude: 0,
    longitude: 0,
  }))

describe('plate-profile/radar-scale', () => {
  it('corta as faixas nos quartis das detecções da placa', () => {
    expect(magnitudeScale(points([8, 1, 7, 2, 6, 3, 5, 4]))).toEqual({
      thresholds: [3, 5, 7],
      max: 8,
    })
    expect(magnitudeScale([])).toEqual({ thresholds: [0, 0, 0], max: 0 })
  })

  it('dá a cor da faixa acima de cada quartil', () => {
    const scale = { thresholds: [3, 5, 7] as [number, number, number], max: 8 }
    expect([3, 4, 6, 8].map((count) => tierStyle(count, scale))).toEqual([
      '--tone:#35c26a',
      '--tone:#e8c33c',
      '--tone:#ef8b3a',
      '--tone:#e04b3f',
    ])
  })

  it('escreve as faixas com os limites reais e pula as vazias por empate', () => {
    expect(
      magnitudeBands({ thresholds: [3, 5, 7], max: 8 }).map(
        (band) => band.label,
      ),
    ).toEqual(['1–3', '4–5', '6–7', '8+'])
    expect(magnitudeBands({ thresholds: [1, 1, 1200], max: 1500 })).toEqual([
      { color: '#35c26a', label: '1' },
      { color: '#ef8b3a', label: '2–1.200' },
      { color: '#e04b3f', label: '1.201+' },
    ])
  })
})
