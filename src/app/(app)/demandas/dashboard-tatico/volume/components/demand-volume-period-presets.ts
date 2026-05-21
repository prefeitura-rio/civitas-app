import type {
  DemandVolumeFilterIn,
  DemandVolumeSummaryPeriod,
} from '@/http/tickets/get-demand-volume'

export type { DemandVolumeSummaryPeriod }

export const SUMMARY_PERIOD_OPTIONS: {
  value: DemandVolumeSummaryPeriod
  label: string
}[] = [
  { value: 'current_year', label: 'Ano atual' },
  { value: 'current_month', label: 'Mês atual' },
  { value: 'current_week', label: 'Semana atual' },
]

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Período padrão dos gráficos/tabelas: 1º de janeiro do ano corrente → hoje. */
export function getDefaultChartDateRange(): Pick<
  DemandVolumeFilterIn,
  'date_from' | 'date_to'
> {
  const now = new Date()
  return {
    date_from: `${now.getFullYear()}-01-01`,
    date_to: toDateString(now),
  }
}

export function createDefaultDemandVolumeFilters(): DemandVolumeFilterIn {
  return {
    summary_period: 'current_year',
    ...getDefaultChartDateRange(),
  }
}
