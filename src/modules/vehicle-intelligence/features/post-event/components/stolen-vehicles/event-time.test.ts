import { formatEventTime } from '@/modules/vehicle-intelligence/features/post-event/components/shared/event-time'
import {
  temporalProfile,
  typicalHourLabel,
} from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/event-time'

describe('temporalProfile', () => {
  it('conta as horas em Brasília, acha a hora típica e reparte em turnos', () => {
    const profile = temporalProfile([
      '2026-06-19 20:00:00-03',
      '2026-06-19T20:30:00-03:00',
      '2026-06-19T23:10:00Z',
      '2026-06-20 03:00:00-03',
      null,
      'sem data',
    ])
    expect(profile.total).toBe(4)
    expect(profile.typicalHour).toBe(20)
    expect(profile.typicalHourCount).toBe(3)
    expect(
      profile.shifts.map((shift) => [shift.label, shift.percentage]),
    ).toEqual([
      ['Madrugada · 0–5h', 25],
      ['Manhã · 6–11h', 0],
      ['Tarde · 12–17h', 0],
      ['Noite · 18–23h', 75],
    ])
  })

  it('sem horário válido, sem hora típica e turnos em zero', () => {
    const profile = temporalProfile([null])
    expect(profile.total).toBe(0)
    expect(profile.typicalHour).toBeNull()
    expect(profile.shifts.every((shift) => shift.percentage === 0)).toBe(true)
    expect(typicalHourLabel(profile)).toBe('Horário não informado')
  })
})

describe('typicalHourLabel', () => {
  it('mostra a faixa de uma hora, virando a meia-noite', () => {
    expect(typicalHourLabel({ ...temporalProfile([]), typicalHour: 7 })).toBe(
      '07h–08h',
    )
    expect(typicalHourLabel({ ...temporalProfile([]), typicalHour: 23 })).toBe(
      '23h–00h',
    )
  })
})

describe('formatEventTime', () => {
  it('data e hora em Brasília', () => {
    expect(formatEventTime('2026-06-19 20:00:00-03')).toBe('19/06/2026, 20:00')
  })

  it('sem valor avisa; texto que não é data volta como veio', () => {
    expect(formatEventTime(null)).toBe('Horário não informado')
    expect(formatEventTime('26/06/2026 12:35')).toBe('26/06/2026 12:35')
  })
})
