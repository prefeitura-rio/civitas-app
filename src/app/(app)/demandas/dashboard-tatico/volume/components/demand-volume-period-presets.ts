import type {
  DemandVolumeFilterIn,
  DemandVolumeSummaryPeriod,
} from '@/http/tickets/get-demand-volume'

import { getDefaultTacticalDashboardSearchPeriod } from '../../utils/default-search-period'

export type { DemandVolumeSummaryPeriod }

export const SUMMARY_PERIOD_OPTIONS: {
  value: DemandVolumeSummaryPeriod
  label: string
}[] = [
  { value: 'current_year', label: 'Ano atual' },
  { value: 'current_month', label: 'Mês atual' },
  { value: 'current_week', label: 'Semana atual' },
]

/** Período padrão dos gráficos/tabelas: últimos 6 meses → hoje. */
export function getDefaultChartDateRange(): Pick<
  DemandVolumeFilterIn,
  'date_from' | 'date_to'
> {
  return getDefaultTacticalDashboardSearchPeriod()
}

export function createDefaultDemandVolumeFilters(): DemandVolumeFilterIn {
  return {
    summary_period: 'current_year',
    ...getDefaultChartDateRange(),
  }
}
