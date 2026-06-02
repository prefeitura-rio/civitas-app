import type {
  OpenTicketsByTeamItemOut,
  OperationalViewGranularity,
  TeamPeriodSeriesOut,
} from '@/http/tickets/get-operational-view'
import { unwrapDashboardItems } from '@/http/tickets/unwrap-dashboard-items'

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
  'pending',
  'bloqueado',
  'blocked',
  'restrito',
  'restricted',
  'aguardando_revisao',
  'awaiting_review',
  'aguardando_revisao_adjunto',
  'awaiting_adjunct_review',
  'aguardando_revisao_administrativo',
  'awaiting_administrative_review',
] as const

const OPEN_TICKETS_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  pending: 'Pendente',
  bloqueado: 'Bloqueado',
  blocked: 'Bloqueado',
  restrito: 'Restrito',
  restricted: 'Restrito',
  aguardando_revisao: 'Aguardando revisão',
  awaiting_review: 'Aguardando revisão',
  aguardando_revisao_adjunto: 'Aguardando revisão adjunto',
  awaiting_adjunct_review: 'Aguardando revisão adjunto',
  aguardando_revisao_administrativo: 'Aguardando revisão administrativo',
  awaiting_administrative_review: 'Aguardando revisão administrativo',
}

export const OPEN_TICKETS_STATUS_COLORS: Record<string, string> = {
  pendente: '#06b2bb',
  pending: '#06b2bb',
  bloqueado: '#b93d52',
  blocked: '#b93d52',
  restrito: '#6b7c8a',
  restricted: '#6b7c8a',
  aguardando_revisao: '#5b4db2',
  awaiting_review: '#5b4db2',
  aguardando_revisao_adjunto: '#4a6eb5',
  awaiting_adjunct_review: '#4a6eb5',
  aguardando_revisao_administrativo: '#7c5cbf',
  awaiting_administrative_review: '#7c5cbf',
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
  const normalizedKey = key.toLowerCase()
  const mapped =
    OPEN_TICKETS_STATUS_LABELS[key] ?? OPEN_TICKETS_STATUS_LABELS[normalizedKey]
  if (mapped) return mapped

  const formatted = normalizedKey.replace(/_/g, ' ')
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function getOpenTicketsStatusColor(key: string): string {
  const normalizedKey = key.toLowerCase()
  return (
    OPEN_TICKETS_STATUS_COLORS[key] ??
    OPEN_TICKETS_STATUS_COLORS[normalizedKey] ??
    DEFAULT_OPEN_TICKETS_STATUS_COLOR
  )
}

export type OpenTicketsStatusSeries = {
  key: string
  label: string
  color: string
}

export function getOpenTicketsStatusSeries(
  items:
    | OpenTicketsByTeamItemOut[]
    | { items?: OpenTicketsByTeamItemOut[] | null }
    | undefined,
): OpenTicketsStatusSeries[] {
  const list = unwrapDashboardItems(items)
  if (!list.length) return []
  return collectOpenTicketsStatusKeys(list).map((key) => ({
    key,
    label: getOpenTicketsStatusLabel(key),
    color: getOpenTicketsStatusColor(key),
  }))
}

/** Barras empilhadas por status em cada equipe (eixo X = equipe). */
export function mapOpenTicketsByTeamForBarChart(
  items:
    | OpenTicketsByTeamItemOut[]
    | { items?: OpenTicketsByTeamItemOut[] | null }
    | undefined,
): OpenTicketsTeamBarPoint[] {
  const list = unwrapDashboardItems(items)
  if (!list.length) return []

  const statusKeys = collectOpenTicketsStatusKeys(list)

  return [...list]
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
  const list = unwrapDashboardItems(series)
  if (!list.length) {
    return { chartData: [], teams: [] }
  }

  const teams = [...new Set(list.map((item) => item.team))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  )

  const periodLabels = [
    ...new Set(
      list.flatMap((item) =>
        unwrapDashboardItems(item.data).map((point) => point.period_label),
      ),
    ),
  ].sort()

  const valueByTeamAndPeriod = new Map<string, number>()
  for (const item of list) {
    for (const point of unwrapDashboardItems(item.data)) {
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
