import type { BreakdownItem } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'
import { hourInBrasilia } from '@/modules/vehicle-intelligence/lib/dates'

/** Horário dos fatos em Brasília: o total com horário, a hora típica e os quatro turnos. */
type TemporalProfile = {
  total: number
  typicalHour: number | null
  typicalHourCount: number
  shifts: BreakdownItem[]
}

export function temporalProfile(values: Array<string | null>): TemporalProfile {
  const hourly = Array.from({ length: 24 }, () => 0)
  values.forEach((value) => {
    const hour = hourInBrasilia(value)
    if (hour !== null) hourly[hour] += 1
  })
  const total = hourly.reduce((sum, count) => sum + count, 0)
  const typicalHourCount = Math.max(...hourly, 0)
  const typicalHour =
    typicalHourCount > 0 ? hourly.indexOf(typicalHourCount) : null
  const shiftCounts = [
    hourly.slice(0, 6).reduce((sum, count) => sum + count, 0),
    hourly.slice(6, 12).reduce((sum, count) => sum + count, 0),
    hourly.slice(12, 18).reduce((sum, count) => sum + count, 0),
    hourly.slice(18, 24).reduce((sum, count) => sum + count, 0),
  ]
  return {
    total,
    typicalHour,
    typicalHourCount,
    shifts: [
      'Madrugada · 0–5h',
      'Manhã · 6–11h',
      'Tarde · 12–17h',
      'Noite · 18–23h',
    ].map((label, index) => ({
      key: String(index),
      label,
      percentage: total
        ? Math.round((shiftCounts[index] / total) * 1000) / 10
        : 0,
    })),
  }
}

/** "20h–21h", ou "Horário não informado". */
export function typicalHourLabel(profile: TemporalProfile): string {
  if (profile.typicalHour === null) return 'Horário não informado'
  const nextHour = (profile.typicalHour + 1) % 24
  return `${String(profile.typicalHour).padStart(2, '0')}h–${String(nextHour).padStart(2, '0')}h`
}
