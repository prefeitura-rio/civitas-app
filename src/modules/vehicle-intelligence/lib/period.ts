/** Recorte temporal dos fatos: últimos meses até o fato mais recente da base. */
const PERIOD_MONTHS = [6, 3, 1] as const

type FactPeriod =
  | { start?: string | null; end?: string | null }
  | null
  | undefined

function parseDay(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function formatDay(date: Date, withYear: boolean): string {
  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return withYear
    ? `${day}/${month}/${date.getUTCFullYear()}`
    : `${day}/${month}`
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
  const end = parseDay(period.end)
  const start = months
    ? periodStart(period.end, months)
    : period.start
      ? parseDay(period.start)
      : null
  if (!start) return null
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear()
  return `${formatDay(start, !sameYear)}–${formatDay(end, true)}`
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
