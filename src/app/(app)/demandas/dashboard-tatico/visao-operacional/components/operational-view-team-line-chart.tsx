'use client'

import type { CSSProperties } from 'react'
import {
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { OperationalViewGranularity } from '@/http/tickets/get-operational-view'

import { DashboardTaticoDataState } from '../../components/dashboard-tatico-data-state'
import { DashboardTaticoSectionTitle } from '../../components/dashboard-tatico-section-title'
import { DemandVolumeChartGranularity } from '../../volume/components/demand-volume-chart-granularity'
import styles from '../../volume/components/demand-volume-top.module.css'
import type { TeamLineChartPoint } from './operational-view-chart-utils'
import { getTeamColor } from './operational-view-team-colors'

interface OperationalViewTeamLineChartProps {
  title: string
  tooltip?: string
  chartData: TeamLineChartPoint[]
  teams: string[]
  granularity: OperationalViewGranularity
  onGranularityChange: (granularity: OperationalViewGranularity) => void
  isLoading: boolean
  isAvailable: boolean
  valueFormatter?: (value: number) => string
}

const CHART_SHELL: CSSProperties = {
  backgroundColor: '#101d28',
  border: '1px solid #4a5d6d',
  borderRadius: '8px',
  padding: '24px',
}

const CHART_COLORS = {
  grid: '#1d3449',
  axis: '#97a2ab',
  tooltip: { bg: '#101d28', border: '#4a5d6d', text: '#f9fafa' },
}

export function OperationalViewTeamLineChart({
  title,
  tooltip,
  chartData,
  teams,
  granularity,
  onGranularityChange,
  isLoading,
  isAvailable,
  valueFormatter = (value) =>
    value.toLocaleString('pt-BR', { maximumFractionDigits: 0 }),
}: OperationalViewTeamLineChartProps) {
  if (!isLoading && !isAvailable) {
    return null
  }

  return (
    <div style={CHART_SHELL}>
      <ChartHeader
        title={title}
        tooltip={tooltip}
        granularity={granularity}
        onGranularityChange={onGranularityChange}
        isLoading={isLoading}
      />

      {chartData.length === 0 ? (
        <DashboardTaticoDataState isLoading={isLoading} isEmpty />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={chartData}
            margin={{ top: 24, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              formatter={(value) =>
                value == null || value === ''
                  ? '—'
                  : valueFormatter(Number(value))
              }
              contentStyle={{
                backgroundColor: CHART_COLORS.tooltip.bg,
                border: `1px solid ${CHART_COLORS.tooltip.border}`,
                borderRadius: '8px',
                color: CHART_COLORS.tooltip.text,
                fontSize: '12px',
              }}
              itemStyle={{ color: CHART_COLORS.tooltip.text }}
              labelStyle={{
                color: CHART_COLORS.tooltip.text,
                fontWeight: 600,
                marginBottom: '4px',
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '24px',
                fontSize: '12px',
                color: '#97a2ab',
              }}
              formatter={(value) => (
                <span style={{ color: '#97a2ab' }}>{value}</span>
              )}
            />
            {teams.map((team, idx) => {
              const color = getTeamColor(team, teams)
              const labelPosition =
                idx % 2 === 0 ? ('top' as const) : ('bottom' as const)
              return (
                <Line
                  key={team}
                  type="monotone"
                  dataKey={team}
                  name={team}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: color, strokeWidth: 0 }}
                  connectNulls
                  activeDot={{ r: 5, strokeWidth: 0 }}
                >
                  <LabelList
                    dataKey={team}
                    position={labelPosition}
                    formatter={(v: unknown) =>
                      v != null && v !== '' ? valueFormatter(Number(v)) : ''
                    }
                    style={{ fontSize: 10, fill: color, fontWeight: 600 }}
                  />
                </Line>
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function ChartHeader({
  title,
  tooltip,
  granularity,
  onGranularityChange,
  isLoading,
}: {
  title: string
  tooltip?: string
  granularity: OperationalViewGranularity
  onGranularityChange: (granularity: OperationalViewGranularity) => void
  isLoading: boolean
}) {
  return (
    <div className={styles.chartHeaderRow}>
      <DashboardTaticoSectionTitle tooltip={tooltip} marginBottom={0}>
        {title}
      </DashboardTaticoSectionTitle>
      <DemandVolumeChartGranularity
        value={granularity}
        onChange={onGranularityChange}
        disabled={isLoading}
      />
    </div>
  )
}
