import { addDays, format, parseISO, subDays } from 'date-fns'

export type ShiftClosingPeriodForm = {
  start_date: string
  start_time: string
  end_time: string
}

const DEFAULT_START_TIME = '07:00:00'
const DEFAULT_END_TIME = '07:00:00'
const SHIFT_START_HOUR = 7

export function getDefaultShiftClosingPeriod(): ShiftClosingPeriodForm {
  const now = new Date()
  const hour = now.getHours()

  const startDate = hour < SHIFT_START_HOUR ? subDays(now, 1) : now

  return {
    start_date: format(startDate, 'yyyy-MM-dd'),
    start_time: DEFAULT_START_TIME,
    end_time: DEFAULT_END_TIME,
  }
}

export function getShiftEndDate(startDate: string): string {
  if (!startDate?.trim()) return ''
  try {
    return format(addDays(parseISO(`${startDate}T00:00:00`), 1), 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

export function toApiTime(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return DEFAULT_START_TIME
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`
  return DEFAULT_START_TIME
}

export function toInputTime(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return '07:00'
  return trimmed.slice(0, 5)
}

export function periodToApiPayload(period: ShiftClosingPeriodForm) {
  return {
    start_date: period.start_date,
    start_time: toApiTime(period.start_time),
    end_time: toApiTime(period.end_time),
  }
}

export function periodFromRecord(
  periodStart: string,
  periodEnd: string,
): ShiftClosingPeriodForm {
  const start = parseISO(periodStart)
  const end = parseISO(periodEnd)
  return {
    start_date: format(start, 'yyyy-MM-dd'),
    start_time: format(start, 'HH:mm:ss'),
    end_time: format(end, 'HH:mm:ss'),
  }
}
