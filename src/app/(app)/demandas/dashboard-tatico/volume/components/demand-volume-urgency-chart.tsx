'use client'

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
  DemandVolumeGranularity,
  PeriodUrgencyItemOut,
} from '@/http/tickets/get-demand-volume'

import { DemandVolumeChartGranularity } from './demand-volume-chart-granularity'
import { formatPeriodLabel } from './demand-volume-period-label'
import styles from './demand-volume-top.module.css'

interface DemandVolumeUrgencyChartProps {
  data: PeriodUrgencyItemOut[]
  granularity: DemandVolumeGranularity
  onGranularityChange: (granularity: DemandVolumeGranularity) => void
  isLoading: boolean
}

const SERIES = [
  { key: 'urgent', label: 'Urgente', color: '#b93d52' },
  { key: 'high', label: 'Alta', color: '#5b4db2' },
  { key: 'routine', label: 'Rotina', color: '#06b2bb' },
  { key: 'no_priority', label: 'Sem Prioridade', color: '#97a2ab' },
] as const

const CHART_COLORS = {
  grid: '#1d3449',
  axis: '#97a2ab',
  tooltip: { bg: '#101d28', border: '#4a5d6d', text: '#f9fafa' },
}

export function DemandVolumeUrgencyChart({
  data,
  granularity,
  onGranularityChange,
  isLoading,
}: DemandVolumeUrgencyChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: formatPeriodLabel(item.period_label, granularity),
  }))

  return (
    <div
      style={{
        backgroundColor: '#101d28',
        border: '1px solid #4a5d6d',
        borderRadius: '8px',
        padding: '24px',
      }}
    >
      <div className={styles.chartHeaderRow}>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#f9fafa',
            margin: 0,
          }}
        >
          Volume de Chamados Encerrados por Urgência
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
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
