'use client'

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
  DemandVolumeGranularity,
  PeriodVolumeItemOut,
} from '@/http/tickets/get-demand-volume'

import { DashboardTaticoDataState } from '../../components/dashboard-tatico-data-state'
import { DashboardTaticoSectionTitle } from '../../components/dashboard-tatico-section-title'
import { VOLUME_TOTAL_TOOLTIP } from '../../components/dashboard-tatico-tooltips'
import { DemandVolumeChartGranularity } from './demand-volume-chart-granularity'
import { formatPeriodLabel } from './demand-volume-period-label'
import styles from './demand-volume-top.module.css'

interface DemandVolumeTotalChartProps {
  data: PeriodVolumeItemOut[]
  granularity: DemandVolumeGranularity
  onGranularityChange: (granularity: DemandVolumeGranularity) => void
  isLoading: boolean
  isAvailable: boolean
}

const SERIES = [
  {
    key: 'created',
    label: 'Chamados Criados',
    color: '#b93d52',
    labelPosition: 'top' as const,
  },
  {
    key: 'closed',
    label: 'Chamados Encerrados',
    color: '#06b2bb',
    labelPosition: 'bottom' as const,
  },
] as const

const CHART_COLORS = {
  grid: '#1d3449',
  axis: '#97a2ab',
  tooltip: { bg: '#101d28', border: '#4a5d6d', text: '#f9fafa' },
}

export function DemandVolumeTotalChart({
  data,
  granularity,
  onGranularityChange,
  isLoading,
  isAvailable,
}: DemandVolumeTotalChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: formatPeriodLabel(item.period_label, granularity),
  }))

  if (!isLoading && !isAvailable) {
    return null
  }

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
        <DashboardTaticoSectionTitle
          tooltip={VOLUME_TOTAL_TOOLTIP}
          marginBottom={0}
        >
          Volume Total de Chamados
        </DashboardTaticoSectionTitle>
        <DemandVolumeChartGranularity
          value={granularity}
          onChange={onGranularityChange}
          disabled={isLoading}
          includeDaily
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
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              >
                <LabelList
                  dataKey={s.key}
                  position={s.labelPosition}
                  formatter={(v: unknown) =>
                    v != null && v !== '' ? String(v) : ''
                  }
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
