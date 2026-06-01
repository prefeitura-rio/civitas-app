import type { OperationalViewFilterIn } from '@/http/tickets/get-operational-view'

import { getDefaultTacticalDashboardSearchPeriod } from '../../utils/default-search-period'

/** Período padrão: últimos 6 meses → hoje. */
export function getDefaultOperationalViewDateRange(): Pick<
  OperationalViewFilterIn,
  'date_from' | 'date_to'
> {
  return getDefaultTacticalDashboardSearchPeriod()
}

export function createDefaultOperationalViewFilters(): OperationalViewFilterIn {
  return {
    summary_period: 'current_year',
    ...getDefaultOperationalViewDateRange(),
  }
}
