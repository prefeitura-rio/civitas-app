import { subMonths } from 'date-fns'

export type TacticalDashboardSearchPeriod = {
  date_from: string
  date_to: string
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Período padrão da busca: 6 meses antes da data de referência → hoje. */
export function getDefaultTacticalDashboardSearchPeriod(
  referenceDate: Date = new Date(),
): TacticalDashboardSearchPeriod {
  return {
    date_from: toDateString(subMonths(referenceDate, 6)),
    date_to: toDateString(referenceDate),
  }
}
