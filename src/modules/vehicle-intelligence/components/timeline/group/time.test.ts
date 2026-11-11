import {
  axisHours,
  hourMinute,
  timeRange,
  toMs,
} from '@/modules/vehicle-intelligence/components/timeline/group/time'
import type {
  TimelineCase,
  TimelineDay,
  TimelineDetection,
} from '@/modules/vehicle-intelligence/components/timeline/timeline-types'

const dayStart = toMs('2026-03-02T00:00:00-03:00')
const hour = 3_600_000

describe('faixa de tempo', () => {
  const day = {
    facts: [{ event_time: '2026-03-02T14:50:00-03:00' } as TimelineCase],
    detections: [
      { detected_at: '2026-03-02T09:30:00-03:00' } as TimelineDetection,
    ],
    tracks: [],
  } as TimelineDay

  it('período com leituras: 20 min de folga e horas cheias', () => {
    expect(timeRange(day, 'period', dayStart, 60)).toEqual([
      dayStart + 9 * hour,
      dayStart + 16 * hour,
    ])
  })

  it('dia inteiro (ou sem nada no dia): 00h–24h com a margem', () => {
    const whole: [number, number] = [dayStart - hour, dayStart + 25 * hour]
    expect(timeRange(day, 'day', dayStart, 60)).toEqual(whole)
    expect(
      timeRange(
        { facts: [], detections: [], tracks: [] },
        'period',
        dayStart,
        60,
      ),
    ).toEqual(whole)
  })

  it('horas do eixo: de 3 em 3 no dia inteiro, de hora em hora no período', () => {
    expect(axisHours('day', dayStart, 0, 0).map((mark) => mark.label)).toEqual([
      '00h',
      '03h',
      '06h',
      '09h',
      '12h',
      '15h',
      '18h',
      '21h',
      '24h',
    ])
    expect(
      axisHours('period', dayStart, dayStart + 9 * hour, dayStart + 12 * hour),
    ).toEqual([
      { at: dayStart + 9 * hour, label: '09h' },
      { at: dayStart + 10 * hour, label: '10h' },
      { at: dayStart + 11 * hour, label: '11h' },
      { at: dayStart + 12 * hour, label: '12h' },
    ])
    expect(hourMinute(dayStart + 9.5 * hour)).toBe('09:30')
  })
})
