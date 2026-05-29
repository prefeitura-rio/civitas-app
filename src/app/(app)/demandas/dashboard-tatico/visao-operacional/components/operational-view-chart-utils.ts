import type {
  OpenTicketsByTeamItemOut,
  OperationalViewGranularity,
  TeamPeriodSeriesOut,
} from '@/http/tickets/get-operational-view'

import { formatPeriodLabel } from '../../volume/components/demand-volume-period-label'

export type TeamLineChartPoint = {
  label: string
  period_label: string
} & Record<string, number | string | null>

export interface OpenTicketsTeamBarPoint {
  team: string
  label: string
  [statusKey: string]: number | string
}

const OPEN_TICKETS_STATUS_ORDER = [
  'pendente',
  'bloqueado',
  'aguardando_revisao',
  'aguardando_revisao_adjunto',
  'aguardando_revisao_administrativo',
] as const

const OPEN_TICKETS_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  bloqueado: 'Bloqueado',
  aguardando_revisao: 'Aguardando revisão',
  aguardando_revisao_adjunto: 'Aguardando revisão adjunto',
  aguardando_revisao_administrativo: 'Aguardando revisão administrativo',
}

export const OPEN_TICKETS_STATUS_COLORS: Record<string, string> = {
  pendente: '#06b2bb',
  bloqueado: '#b93d52',
  aguardando_revisao: '#5b4db2',
  aguardando_revisao_adjunto: '#4a6eb5',
  aguardando_revisao_administrativo: '#7c5cbf',
}

const DEFAULT_OPEN_TICKETS_STATUS_COLOR = '#6b7c8a'

function collectOpenTicketsStatusKeys(
  items: OpenTicketsByTeamItemOut[],
): string[] {
  const keys = new Set<string>()
  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      if (key === 'team' || typeof value !== 'number') continue
      keys.add(key)
    }
  }
  return [...keys].sort((a, b) => {
    const orderA = OPEN_TICKETS_STATUS_ORDER.indexOf(
      a as (typeof OPEN_TICKETS_STATUS_ORDER)[number],
    )
    const orderB = OPEN_TICKETS_STATUS_ORDER.indexOf(
      b as (typeof OPEN_TICKETS_STATUS_ORDER)[number],
    )
    const rankA = orderA === -1 ? OPEN_TICKETS_STATUS_ORDER.length : orderA
    const rankB = orderB === -1 ? OPEN_TICKETS_STATUS_ORDER.length : orderB
    if (rankA !== rankB) return rankA - rankB
    return a.localeCompare(b, 'pt-BR')
  })
}

export function getOpenTicketsStatusLabel(key: string): string {
  return (
    OPEN_TICKETS_STATUS_LABELS[key] ??
    key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  )
}

export function getOpenTicketsStatusColor(key: string): string {
  return OPEN_TICKETS_STATUS_COLORS[key] ?? DEFAULT_OPEN_TICKETS_STATUS_COLOR
}

export type OpenTicketsStatusSeries = {
  key: string
  label: string
  color: string
}

export function getOpenTicketsStatusSeries(
  items: OpenTicketsByTeamItemOut[] | undefined,
): OpenTicketsStatusSeries[] {
  if (!items?.length) return []
  return collectOpenTicketsStatusKeys(items).map((key) => ({
    key,
    label: getOpenTicketsStatusLabel(key),
    color: getOpenTicketsStatusColor(key),
  }))
}

/** Barras empilhadas por status em cada equipe (eixo X = equipe). */
export function mapOpenTicketsByTeamForBarChart(
  items: OpenTicketsByTeamItemOut[] | undefined,
): OpenTicketsTeamBarPoint[] {
  if (!items?.length) return []

  const statusKeys = collectOpenTicketsStatusKeys(items)

  return [...items]
    .sort((a, b) => a.team.localeCompare(b.team, 'pt-BR'))
    .map((item) => {
      const point: OpenTicketsTeamBarPoint = {
        team: item.team,
        label: item.team,
      }
      for (const key of statusKeys) {
        const value = item[key as keyof OpenTicketsByTeamItemOut]
        if (typeof value === 'number') {
          point[key] = value
        }
      }
      return point
    })
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
