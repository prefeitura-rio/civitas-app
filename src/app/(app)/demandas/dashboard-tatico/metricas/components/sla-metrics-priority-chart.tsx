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

import type {
  AvgResolutionTimeByPriorityItemOut,
  SlaDashboardGranularity,
} from '@/http/tickets/get-sla-dashboard'

import { DemandVolumeChartGranularity } from '../../volume/components/demand-volume-chart-granularity'
import { formatPeriodLabel } from '../../volume/components/demand-volume-period-label'
import styles from '../../volume/components/demand-volume-top.module.css'

interface SlaMetricsPriorityChartProps {
  data: AvgResolutionTimeByPriorityItemOut[]
  granularity: SlaDashboardGranularity
  onGranularityChange: (granularity: SlaDashboardGranularity) => void
  isLoading: boolean
}

const SERIES = [
  { key: 'urgent_days', label: 'Urgente', color: '#b93d52' },
  { key: 'high_days', label: 'Alta', color: '#5b4db2' },
  { key: 'routine_days', label: 'Rotina', color: '#06b2bb' },
] as const

const CHART_COLORS = {
  grid: '#1d3449',
  axis: '#97a2ab',
  tooltip: { bg: '#101d28', border: '#4a5d6d', text: '#f9fafa' },
}

const CHART_SHELL: CSSProperties = {
  backgroundColor: '#101d28',
  border: '1px solid #4a5d6d',
  borderRadius: '8px',
  padding: '24px',
}

function formatDaysTooltip(value: number | string | undefined): string {
  if (value == null || value === '') return '—'
  const n = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(n)) return '—'
  return `${n.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} dias`
}

export function SlaMetricsPriorityChart({
  data,
  granularity,
  onGranularityChange,
  isLoading,
}: SlaMetricsPriorityChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: formatPeriodLabel(item.period_label, granularity),
  }))

  return (
    <div style={CHART_SHELL}>
      <div className={styles.chartHeaderRow}>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#f9fafa',
            margin: 0,
          }}
        >
          Tempo Médio de Resolução de Demandas (Por prioridade)
        </h2>
        <DemandVolumeChartGranularity
          value={granularity}
          onChange={onGranularityChange}
          disabled={isLoading}
        />
      </div>

      {isLoading && chartData.length === 0 ? (
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
              formatter={(value) => formatDaysTooltip(value as number)}
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
              wrapperStyle={{ paddingTop: '24px', fontSize: '12px' }}
              formatter={(value) => (
                <span style={{ color: '#97a2ab' }}>{value}</span>
              )}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
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
