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

import type {
  AvgResolutionTimeByPriorityItemOut,
  SlaDashboardGranularity,
} from '@/http/tickets/get-sla-dashboard'

import { DashboardTaticoDataState } from '../../components/dashboard-tatico-data-state'
import { DashboardTaticoSectionTitle } from '../../components/dashboard-tatico-section-title'
import { SLA_PRIORITY_RESOLUTION_TOOLTIP } from '../../components/dashboard-tatico-tooltips'
import { DemandVolumeChartGranularity } from '../../volume/components/demand-volume-chart-granularity'
import { formatPeriodLabel } from '../../volume/components/demand-volume-period-label'
import styles from '../../volume/components/demand-volume-top.module.css'

interface SlaMetricsPriorityChartProps {
  data: AvgResolutionTimeByPriorityItemOut[]
  granularity: SlaDashboardGranularity
  onGranularityChange: (granularity: SlaDashboardGranularity) => void
  isLoading: boolean
  isAvailable: boolean
}

const SERIES = [
  {
    key: 'urgent_days',
    label: 'Urgente',
    color: '#b93d52',
    labelPosition: 'top' as const,
  },
  {
    key: 'high_days',
    label: 'Alta',
    color: '#5b4db2',
    labelPosition: 'bottom' as const,
  },
  {
    key: 'routine_days',
    label: 'Rotina',
    color: '#06b2bb',
    labelPosition: 'top' as const,
  },
  {
    key: 'no_priority_days',
    label: 'Sem Prioridade',
    color: '#97a2ab',
    labelPosition: 'bottom' as const,
  },
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
  isAvailable,
}: SlaMetricsPriorityChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: formatPeriodLabel(item.period_label, granularity),
  }))

  if (!isLoading && !isAvailable) {
    return null
  }

  return (
    <div style={CHART_SHELL}>
      <div className={styles.chartHeaderRow}>
        <DashboardTaticoSectionTitle
          tooltip={SLA_PRIORITY_RESOLUTION_TOOLTIP}
          marginBottom={0}
        >
          Tempo Médio de Resposta de Demandas (Por Prioridade)
        </DashboardTaticoSectionTitle>
        <DemandVolumeChartGranularity
          value={granularity}
          onChange={onGranularityChange}
          disabled={isLoading}
        />
      </div>

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
                dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                connectNulls
                activeDot={{ r: 5, strokeWidth: 0 }}
              >
                <LabelList
                  dataKey={s.key}
                  position={s.labelPosition}
                  formatter={(v: unknown) => {
                    const n = Number(v)
                    return !isNaN(n) && v != null && v !== ''
                      ? n.toFixed(1)
                      : ''
                  }}
                  style={{ fontSize: 10, fill: s.color, fontWeight: 600 }}
                />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
