import {
  dayLabel,
  periodDates,
  periodRangeLabel,
} from '@/modules/vehicle-intelligence/components/filters/fact-period'

const BASE = {
  start: '2026-01-02T08:00:00-03:00',
  end: '2026-10-10T23:10:00-03:00',
}

describe('período dos fatos', () => {
  it('conta os atalhos a partir do fato mais recente da base', () => {
    expect(periodDates({ preset: '12m' }, BASE)).toEqual({
      start: '2025-10-11',
      end: '2026-10-10',
    })
    expect(periodDates({ preset: '3m' }, BASE)).toEqual({
      start: '2026-07-11',
      end: '2026-10-10',
    })
    expect(periodDates({ preset: '30d' }, BASE)).toEqual({
      start: '2026-09-11',
      end: '2026-10-10',
    })
  })

  it('base inteira e intervalo livre não dependem do fato mais recente', () => {
    expect(periodDates({ preset: 'all' }, BASE)).toEqual({
      start: null,
      end: null,
    })
    expect(
      periodDates({ preset: 'custom', start: '2026-03-01' }, null),
    ).toEqual({ start: '2026-03-01', end: null })
  })

  it('sem o período da base, os atalhos não restringem', () => {
    expect(periodDates({ preset: '6m' }, undefined)).toEqual({
      start: null,
      end: null,
    })
  })

  it('escreve as faixas dos atalhos e as datas do intervalo', () => {
    expect(periodRangeLabel('all', BASE)).toBe('jan/26 – out/26')
    expect(periodRangeLabel('12m', BASE)).toBe('out/25 – out/26')
    expect(periodRangeLabel('3m', null)).toBe('')
    expect(dayLabel('2026-03-01')).toBe('01/03/2026')
  })
})
