import {
  formatDate,
  formatDateTime,
  formatDayMonth,
  formatDayMonthYear,
  formatInBrasilia,
  parseInstant,
} from '@/modules/vehicle-intelligence/lib/dates'

describe('instante', () => {
  it('lê uma data sem hora como meio-dia de Brasília, para não mudar de dia', () => {
    expect(parseInstant('2026-10-10').toISOString()).toBe(
      '2026-10-10T15:00:00.000Z',
    )
  })

  it('lê um mês sem dia como o dia 1', () => {
    expect(parseInstant('2026-10').toISOString()).toBe(
      '2026-10-01T15:00:00.000Z',
    )
  })

  it('lê um instante sem fuso no horário de Brasília', () => {
    expect(parseInstant('2026-10-10 16:12').toISOString()).toBe(
      '2026-10-10T19:12:00.000Z',
    )
    expect(parseInstant('2026-10-10T16:12:30.5').toISOString()).toBe(
      '2026-10-10T19:12:30.500Z',
    )
  })

  it('aceita o fuso sem minutos que o banco devolve', () => {
    expect(parseInstant('2026-10-10 16:12:00-03').toISOString()).toBe(
      '2026-10-10T19:12:00.000Z',
    )
  })

  it('respeita instantes em UTC', () => {
    expect(parseInstant('2026-10-10T19:12:00Z').toISOString()).toBe(
      '2026-10-10T19:12:00.000Z',
    )
  })
})

describe('formatação no horário de Brasília', () => {
  it('converte um instante UTC para Brasília', () => {
    expect(formatDateTime('2026-10-11T02:30:00Z')).toBe('10/10/2026, 23:30')
  })

  it('formata datas e dias', () => {
    expect(formatDate('2026-10-10')).toBe('10/10/2026')
    expect(formatDayMonth('2026-10-14T12:00:00-03:00')).toBe('14/10')
    expect(formatDayMonthYear('2026-10-14')).toBe('14/10/26')
  })

  it('devolve o texto de vazio sem valor ou com valor inválido', () => {
    expect(formatDateTime(null)).toBe('—')
    expect(formatDate('')).toBe('—')
    expect(formatDayMonth('não é data')).toBe('—')
    expect(formatInBrasilia(undefined, { year: 'numeric' }, 'sem data')).toBe(
      'sem data',
    )
  })
})
