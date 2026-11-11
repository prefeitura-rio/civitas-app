import { eachDay } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-format'
import {
  CORRELATION_SECTION_DEFS,
  correlationSectionBadge,
  sectionBadge,
} from '@/modules/vehicle-intelligence/features/plate-profile/profile-sections'
import type {
  PlateCorrelationsData,
  PlateProfileData,
} from '@/modules/vehicle-intelligence/types/domain'

const profile = {
  period: { start: '2026-02-27T08:00:00-03:00', end: '2026-03-02' },
  summary: { active_days: 2 },
  top_locations: Array.from({ length: 9 }, (_, index) => ({
    point_id: String(index),
  })),
  hiatos: { count: 1234 },
} as unknown as PlateProfileData

describe('plate-profile/profile-sections', () => {
  it('lista os dias do período no calendário, virando o mês', () => {
    expect(eachDay('2026-02-27', '2026-03-02')).toEqual([
      '2026-02-27',
      '2026-02-28',
      '2026-03-01',
      '2026-03-02',
    ])
    expect(eachDay('2026-03-02', '2026-03-01')).toEqual([])
  })

  it('dá o número de cada seção das tendências', () => {
    expect(sectionBadge('onde-circula', profile)).toBe('9')
    expect(sectionBadge('quando-circula', profile)).toBe('4')
    expect(
      sectionBadge('quando-circula', {
        ...profile,
        period: { start: null, end: null },
      }),
    ).toBe('2')
    expect(sectionBadge('recorrencia', profile)).toBe('6')
    expect(sectionBadge('rotina-semanal', profile)).toBe('')
    expect(sectionBadge('turnos', profile)).toBe('4')
    expect(sectionBadge('hiatos', profile)).toBe('1.234')
  })

  it('dá o número de cada seção das correlações', () => {
    const data = {
      summary: { linked_events: 3 },
      occurrences: [
        { role: 'candidate' },
        { role: 'victim' },
        { role: 'candidate' },
      ],
    } as unknown as PlateCorrelationsData
    const badges = (indicators: number) =>
      CORRELATION_SECTION_DEFS.map(({ id }) =>
        correlationSectionBadge(
          id,
          data,
          Array.from({ length: indicators }, () => ({
            kind: 'cerco',
            chip: '',
            title: '',
            lines: [],
          })),
        ),
      )
    expect(badges(1)).toEqual(['1 indicador', '3', '2'])
    expect(badges(0)).toEqual(['', '3', '2'])
  })
})
