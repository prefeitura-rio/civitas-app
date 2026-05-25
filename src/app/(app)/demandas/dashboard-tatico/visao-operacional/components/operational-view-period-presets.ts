import type { OperationalViewFilterIn } from '@/http/tickets/get-operational-view'

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getDefaultOperationalViewDateRange(): Pick<
  OperationalViewFilterIn,
  'date_from' | 'date_to'
> {
  const now = new Date()
  return {
    date_from: `${now.getFullYear()}-01-01`,
    date_to: toDateString(now),
  }
}

export function createDefaultOperationalViewFilters(): OperationalViewFilterIn {
  return {
    summary_period: 'current_year',
    ...getDefaultOperationalViewDateRange(),
  }
}
