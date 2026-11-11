/** Recorte temporal dos fatos: últimos meses até o fato mais recente da base. */
import { formatDayRange } from '@/modules/vehicle-intelligence/lib/dates'

const PERIOD_MONTHS = [6, 3, 1] as const

type FactPeriod =
  | { start?: string | null; end?: string | null }
  | null
  | undefined

function parseDay(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/** Mesma regra do backend: o dia seguinte ao último fato, recuado N meses. */
export function periodStart(end: string, months: number): Date {
  const next = parseDay(end)
  next.setUTCDate(next.getUTCDate() + 1)
  const target = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth() - months, 1),
  )
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate()
  target.setUTCDate(Math.min(next.getUTCDate(), lastDay))
  return target
}

function periodRange(months: number | null, period: FactPeriod): string | null {
  if (!period?.end) return null
  const start = months
    ? periodStart(period.end, months).toISOString().slice(0, 10)
    : period.start
  return start ? formatDayRange(start, period.end, '–') : null
}

function periodName(months: number | null, period: FactPeriod): string {
  if (!months) {
    const sameYear =
      period?.start &&
      period?.end &&
      period.start.slice(0, 4) === period.end.slice(0, 4)
    return sameYear ? 'Todo o ano' : 'Todo o período'
  }
  return months === 1 ? 'Último mês' : `Últimos ${months} meses`
}

export function periodLabel(months: number | null, period: FactPeriod): string {
  const range = periodRange(months, period)
  return range
    ? `${periodName(months, period)} · ${range}`
    : periodName(months, period)
}

export function periodChoices(
  available: number[] | undefined,
): Array<number | null> {
  // Sem opções carregadas ainda, oferece todas; uma lista vazia indica base sem horário dos fatos.
  const offered = available
    ? PERIOD_MONTHS.filter((months) => available.includes(months))
    : [...PERIOD_MONTHS]
  return [null, ...offered]
}
