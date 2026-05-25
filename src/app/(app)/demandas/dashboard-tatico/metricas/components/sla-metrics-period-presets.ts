import type { SlaDashboardFilterIn } from '@/http/tickets/get-sla-dashboard'

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Período padrão: 1º de janeiro do ano corrente → hoje. */
export function getDefaultSlaMetricsDateRange(): Pick<
  SlaDashboardFilterIn,
  'date_from' | 'date_to'
> {
  const now = new Date()
  return {
    date_from: `${now.getFullYear()}-01-01`,
    date_to: toDateString(now),
  }
}

export function createDefaultSlaMetricsFilters(): SlaDashboardFilterIn {
  return getDefaultSlaMetricsDateRange()
}
