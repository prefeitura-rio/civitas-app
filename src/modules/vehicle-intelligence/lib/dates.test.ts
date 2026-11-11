import {
  calendarDaySpan,
  formatCivilDay,
  formatDate,
  formatDateTime,
  formatDayMonth,
  formatDayMonthYear,
  formatInBrasilia,
  formatTime,
  formatTimeSeconds,
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
    expect(formatDateTime('2026-01-16T17:05:00Z')).toBe('16/01/2026, 14:05')
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

describe('horários', () => {
  it('formatTimeSeconds mostra HH:MM:SS em Brasília, venha o instante com fuso ou em UTC', () => {
    expect(formatTimeSeconds('2026-03-02T14:03:07-03:00')).toBe('14:03:07')
    expect(formatTimeSeconds('2026-03-02T17:03:07Z')).toBe('14:03:07')
    expect(formatTimeSeconds('2026-03-02 14:03:07')).toBe('14:03:07')
  })
})

describe('dias civis', () => {
  it('conta os dias entre o primeiro e o último fato', () => {
    expect(calendarDaySpan('2026-01-01', '2026-01-31')).toBe(31)
    expect(
      calendarDaySpan('2026-01-01T10:00:00-03:00', '2026-01-01T10:00:00-03:00'),
    ).toBe(1)
    expect(calendarDaySpan(null, '2026-01-31')).toBe(0)
  })

  it('escreve a data civil sem passar pelo fuso e a hora em Brasília', () => {
    expect(formatCivilDay('2026-01-16')).toBe('16/01/2026')
    expect(formatCivilDay('2026-01-16T01:00:00Z')).toBe('16/01/2026')
    expect(formatCivilDay(null, 'data não informada')).toBe(
      'data não informada',
    )
    expect(formatTime('2026-01-16T17:05:00Z')).toBe('14:05')
  })
})
