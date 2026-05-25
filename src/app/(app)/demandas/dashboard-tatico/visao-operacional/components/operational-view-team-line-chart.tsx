'use client'

import type { CSSProperties } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { OperationalViewGranularity } from '@/http/tickets/get-operational-view'

import { DemandVolumeChartGranularity } from '../../volume/components/demand-volume-chart-granularity'
import styles from '../../volume/components/demand-volume-top.module.css'
import type { TeamLineChartPoint } from './operational-view-chart-utils'
import { getTeamColor } from './operational-view-team-colors'

interface OperationalViewTeamLineChartProps {
  title: string
  chartData: TeamLineChartPoint[]
  teams: string[]
  granularity: OperationalViewGranularity
  onGranularityChange: (granularity: OperationalViewGranularity) => void
  isLoading: boolean
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
  chartData,
  teams,
  granularity,
  onGranularityChange,
  isLoading,
  valueFormatter = (value) =>
    value.toLocaleString('pt-BR', { maximumFractionDigits: 0 }),
}: OperationalViewTeamLineChartProps) {
  return (
    <div style={CHART_SHELL}>
      <ChartHeader
        title={title}
        granularity={granularity}
        onGranularityChange={onGranularityChange}
        isLoading={isLoading}
      />

      {isLoading && chartData.length === 0 ? (
        <LoadingState />
      ) : chartData.length === 0 ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
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
            {teams.map((team) => (
              <Line
                key={team}
                type="monotone"
                dataKey={team}
                name={team}
                stroke={getTeamColor(team, teams)}
                strokeWidth={2}
                dot={false}
                connectNulls
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function ChartHeader({
  title,
  granularity,
  onGranularityChange,
  isLoading,
}: {
  title: string
  granularity: OperationalViewGranularity
  onGranularityChange: (granularity: OperationalViewGranularity) => void
  isLoading: boolean
}) {
  return (
    <div className={styles.chartHeaderRow}>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#f9fafa',
          margin: 0,
        }}
      >
        {title}
      </h2>
      <DemandVolumeChartGranularity
        value={granularity}
        onChange={onGranularityChange}
        disabled={isLoading}
      />
    </div>
  )
}

function LoadingState() {
  return (
    <div
      style={{
        height: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#97a2ab',
        fontSize: '14px',
      }}
    >
      Carregando…
    </div>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        height: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#97a2ab',
        fontSize: '14px',
      }}
    >
      Nenhum dado disponível
    </div>
  )
}
