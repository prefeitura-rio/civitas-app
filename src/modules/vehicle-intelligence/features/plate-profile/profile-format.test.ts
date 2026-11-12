import {
  candidateRgba,
  hexToRgba,
  victimRgba,
} from '@/modules/vehicle-intelligence/features/plate-profile/profile-colors'
import {
  formatPercent,
  formatTimestamp,
  monthTicks,
} from '@/modules/vehicle-intelligence/features/plate-profile/profile-format'

describe('plate-profile/profile-format', () => {
  it('escreve a porcentagem com até uma casa', () => {
    expect(formatPercent(12.345)).toBe('12,3%')
    expect(formatPercent(50)).toBe('50%')
  })

  it('mostra o instante no horário de Brasília, com traço quando falta', () => {
    expect(formatTimestamp('2026-01-16T17:05:00Z')).toBe('16/01/2026, 14:05')
    expect(formatTimestamp(null)).toBe('—')
  })

  it('marca um tick por virada de mês, ou as pontas quando há menos de duas', () => {
    const series = [
      '2026-01-30',
      '2026-01-31',
      '2026-02-01',
      '2026-02-02',
      '2026-03-01',
    ].map((day) => ({ day }))
    expect(monthTicks(series)).toEqual(['2026-02-01', '2026-03-01'])
    expect(monthTicks(series.slice(0, 3))).toEqual(['2026-01-30', '2026-02-01'])
    expect(monthTicks([])).toEqual([])
  })
})

describe('plate-profile/profile-colors', () => {
  it('passa a cor para o RGBA do deck.gl sem mudar o valor', () => {
    expect(hexToRgba('#20d6ff', 128)).toEqual([32, 214, 255, 128])
    expect(victimRgba).toEqual([11, 116, 196, 235])
    expect(candidateRgba).toEqual([192, 51, 74, 235])
  })
})
