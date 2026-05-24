import type {
  OpenTicketsByTeamItemOut,
  OpenTicketsTeamPeriodSeriesOut,
  OperationalViewGranularity,
  OperationalViewGranularitySeries,
  TeamPeriodSeriesOut,
} from '@/http/tickets/get-operational-view'

import { formatPeriodLabel } from '../../volume/components/demand-volume-period-label'

export type TeamLineChartPoint = {
  label: string
  period_label: string
} & Record<string, number | string | null>

export type OpenTicketsPeriodBarPoint = {
  label: string
  period_label: string
} & Record<string, number | string>

const OPEN_TICKETS_STATUS_KEYS = [
  'pendente',
  'bloqueado',
  'aguardando_revisao',
] as const

export type OpenTicketsStatusKey = (typeof OPEN_TICKETS_STATUS_KEYS)[number]

export function openTicketsBarDataKey(
  team: string,
  status: OpenTicketsStatusKey,
): string {
  return `${team}__${status}`
}

function isPeriodWithinDateRange(
  periodLabel: string,
  dateFrom: string | undefined,
  dateTo: string | undefined,
  granularity: OperationalViewGranularity,
): boolean {
  if (!dateFrom && !dateTo) return true

  if (granularity === 'monthly') {
    const [year, month] = periodLabel.split('-').map(Number)
    if (!year || !month) return true
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const periodEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    if (dateFrom && periodEnd < dateFrom) return false
    if (dateTo && periodStart > dateTo) return false
    return true
  }

  if (granularity === 'yearly') {
    const year = Number(periodLabel)
    if (!year) return true
    const periodStart = `${year}-01-01`
    const periodEnd = `${year}-12-31`
    if (dateFrom && periodEnd < dateFrom) return false
    if (dateTo && periodStart > dateTo) return false
    return true
  }

  // Semanal: mantém todos os pontos retornados pelo backend no intervalo filtrado.
  return true
}

/** Barras empilhadas por equipe ao longo dos períodos da granularidade selecionada. */
export function pivotOpenTicketsForBarChart(
  series:
    | OperationalViewGranularitySeries<OpenTicketsTeamPeriodSeriesOut>
    | undefined,
  granularity: OperationalViewGranularity,
  dateFrom?: string,
  dateTo?: string,
): { chartData: OpenTicketsPeriodBarPoint[]; teams: string[] } {
  const teamSeries = series?.[granularity] ?? []
  if (!teamSeries.length) return { chartData: [], teams: [] }

  const teams = [...new Set(teamSeries.map((item) => item.team))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  )

  const filteredPeriodLabels = [
    ...new Set(
      teamSeries.flatMap(({ data }) =>
        data
          .filter((point) =>
            isPeriodWithinDateRange(
              point.period_label,
              dateFrom,
              dateTo,
              granularity,
            ),
          )
          .map((point) => point.period_label),
      ),
    ),
  ].sort()

  const periodLabels =
    filteredPeriodLabels.length > 0
      ? filteredPeriodLabels
      : [
          ...new Set(
            teamSeries.flatMap((item) =>
              item.data.map((point) => point.period_label),
            ),
          ),
        ].sort()

  const valueByTeamPeriod = new Map<string, OpenTicketsByTeamItemOut>()
  for (const { team, data } of teamSeries) {
    for (const point of data) {
      valueByTeamPeriod.set(`${team}::${point.period_label}`, {
        team,
        pendente: point.pendente,
        bloqueado: point.bloqueado,
        aguardando_revisao: point.aguardando_revisao,
      })
    }
  }

  const chartData = periodLabels.map((periodLabel) => {
    const row: OpenTicketsPeriodBarPoint = {
      period_label: periodLabel,
      label: formatPeriodLabel(periodLabel, granularity),
    }

    for (const team of teams) {
      const values = valueByTeamPeriod.get(`${team}::${periodLabel}`)
      for (const status of OPEN_TICKETS_STATUS_KEYS) {
        row[openTicketsBarDataKey(team, status)] = values?.[status] ?? 0
      }
    }

    return row
  })

  return { chartData, teams }
}

export function pivotTeamPeriodSeries(
  series: TeamPeriodSeriesOut[],
  granularity: OperationalViewGranularity,
): { chartData: TeamLineChartPoint[]; teams: string[] } {
  if (!series.length) {
    return { chartData: [], teams: [] }
  }

  const teams = [...new Set(series.map((item) => item.team))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  )

  const periodLabels = [
    ...new Set(
      series.flatMap((item) => item.data.map((point) => point.period_label)),
    ),
  ].sort()

  const valueByTeamAndPeriod = new Map<string, number>()
  for (const item of series) {
    for (const point of item.data) {
      valueByTeamAndPeriod.set(
        `${item.team}::${point.period_label}`,
        point.value,
      )
    }
  }

  const chartData = periodLabels.map((periodLabel) => {
    const row: TeamLineChartPoint = {
      period_label: periodLabel,
      label: formatPeriodLabel(periodLabel, granularity),
    }
    for (const team of teams) {
      row[team] = valueByTeamAndPeriod.get(`${team}::${periodLabel}`) ?? null
    }
    return row
  })

  return { chartData, teams }
}
