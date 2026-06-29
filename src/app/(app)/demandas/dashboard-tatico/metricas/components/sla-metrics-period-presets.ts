import type { SlaDashboardFilterIn } from '@/http/tickets/get-sla-dashboard'

import { getDefaultTacticalDashboardSearchPeriod } from '../../utils/default-search-period'

/** Período padrão: último mês → hoje. */
export function getDefaultSlaMetricsDateRange(): Pick<
  SlaDashboardFilterIn,
  'date_from' | 'date_to'
> {
  return getDefaultTacticalDashboardSearchPeriod()
}

export function createDefaultSlaMetricsFilters(): SlaDashboardFilterIn {
  return getDefaultSlaMetricsDateRange()
}
