/** Horários da timeline do grupo: HH:MM, o instante em ms, a faixa de tempo do eixo e as horas marcadas nele. */
import type { TimelineDay } from '@/modules/vehicle-intelligence/components/timeline/timeline-types'
import {
  brasiliaFormatter,
  parseInstant,
} from '@/modules/vehicle-intelligence/lib/dates'

const HOUR_MINUTE = brasiliaFormatter({ hour: '2-digit', minute: '2-digit' })
export const hourMinute = (time: number) => HOUR_MINUTE.format(new Date(time))
export const toMs = (value: string) => parseInstant(value).getTime()

/** O eixo mostra o período com leituras ou o dia inteiro. */
export type TimeRangeMode = 'period' | 'day'

/** Faixa de tempo: o período com leituras (20 min de folga, horas cheias) ou o dia inteiro com a margem. */
export function timeRange(
  day: TimelineDay,
  range: TimeRangeMode,
  civilDayStart: number,
  dayMarginMinutes: number,
): [number, number] {
  if (range === 'day' || (!day.detections.length && !day.facts.length))
    return [
      civilDayStart - dayMarginMinutes * 60_000,
      civilDayStart + 86_400_000 + dayMarginMinutes * 60_000,
    ]
  const times = [
    ...day.detections.map((detection) => toMs(detection.detected_at)),
    ...day.facts.map((f) => toMs(f.event_time)),
  ]
  const hour = 3_600_000
  return [
    Math.floor((Math.min(...times) - 20 * 60_000) / hour) * hour,
    Math.ceil((Math.max(...times) + 20 * 60_000) / hour) * hour,
  ]
}

/** As horas marcadas no eixo: de 3 em 3 h no dia inteiro, de hora em hora no período. */
export function axisHours(
  range: TimeRangeMode,
  civilDayStart: number,
  rangeStart: number,
  rangeEnd: number,
) {
  const marks: Array<{ at: number; label: string }> = []
  if (range === 'day')
    for (let h = 0; h <= 24; h += 3)
      marks.push({
        at: civilDayStart + h * 3_600_000,
        label: `${String(h).padStart(2, '0')}h`,
      })
  else
    for (let t = rangeStart; t <= rangeEnd; t += 3_600_000)
      marks.push({ at: t, label: `${hourMinute(t).slice(0, 2)}h` })
  return marks
}
