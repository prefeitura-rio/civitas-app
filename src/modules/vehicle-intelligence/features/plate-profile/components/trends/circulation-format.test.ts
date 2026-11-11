import {
  fillDaily,
  formatCoords,
  normalizeNeighborhood,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-format'

describe('plate-profile/circulation-format', () => {
  it('mostra as coordenadas com seis casas, ou nada sem as duas', () => {
    expect(formatCoords(-22.9761544, -43.19)).toBe('-22.976154, -43.190000')
    expect(formatCoords(null, -43.19)).toBeNull()
  })

  it('completa com zero os dias do período sem passagem', () => {
    const daily = [{ day: '2026-01-02', count: 3 }]
    expect(
      fillDaily(daily, ['2026-01-01', '2026-01-02', '2026-01-03']),
    ).toEqual([
      { day: '2026-01-01', count: 0 },
      { day: '2026-01-02', count: 3 },
      { day: '2026-01-03', count: 0 },
    ])
    expect(fillDaily(daily, [])).toEqual(daily)
    expect(fillDaily(undefined, ['2026-01-01'])).toEqual([
      { day: '2026-01-01', count: 0 },
    ])
  })

  it('casa o nome do bairro dos radares com o da malha oficial', () => {
    expect(normalizeNeighborhood('Copacabana')).toBe('COPACABANA')
    expect(normalizeNeighborhood('São Cristóvão')).toBe(
      'IMPERIALDESAOCRISTOVAO',
    )
    expect(normalizeNeighborhood('Freguesia (Ilha do Governador)')).toBe(
      'FREGUESIAILHA',
    )
  })
})
