'use client'

import type { CSSProperties } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { OperationalViewGranularity } from '@/http/tickets/get-operational-view'

import { DemandVolumeChartGranularity } from '../../volume/components/demand-volume-chart-granularity'
import styles from '../../volume/components/demand-volume-top.module.css'
import {
  openTicketsBarDataKey,
  type OpenTicketsPeriodBarPoint,
} from './operational-view-chart-utils'

interface OperationalViewOpenTicketsChartProps {
  chartData: OpenTicketsPeriodBarPoint[]
  teams: string[]
  granularity: OperationalViewGranularity
  onGranularityChange: (granularity: OperationalViewGranularity) => void
  isLoading: boolean
}

const STATUS_SERIES = [
  { key: 'pendente', label: 'Pendente' },
  { key: 'bloqueado', label: 'Bloqueado' },
  { key: 'aguardando_revisao', label: 'Aguardando revisão' },
] as const

const STATUS_COLORS: Record<(typeof STATUS_SERIES)[number]['key'], string> = {
  pendente: '#06b2bb',
  bloqueado: '#b93d52',
  aguardando_revisao: '#5b4db2',
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

export function OperationalViewOpenTicketsChart({
  chartData,
  teams,
  granularity,
  onGranularityChange,
  isLoading,
}: OperationalViewOpenTicketsChartProps) {
  return (
    <div style={CHART_SHELL}>
      <ChartHeaderBlock
        granularity={granularity}
        onGranularityChange={onGranularityChange}
        isLoading={isLoading}
      />

      {isLoading && chartData.length === 0 ? (
        <ChartMessage message="Carregando…" />
      ) : chartData.length === 0 ? (
        <ChartMessage message="Nenhum dado disponível" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            key={granularity}
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
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
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value, _name, item) => {
                const dataKey = String(item.dataKey ?? '')
                const team = teams.find((name) =>
                  dataKey.startsWith(`${name}__`),
                )
                const status = STATUS_SERIES.find((s) =>
                  dataKey.endsWith(`__${s.key}`),
                )
                const numeric =
                  typeof value === 'number' ? value : Number(value ?? 0)
                return [
                  numeric.toLocaleString('pt-BR'),
                  team && status ? `${team} — ${status.label}` : status?.label,
                ]
              }}
              labelFormatter={(label) => String(label)}
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
              verticalAlign="bottom"
              align="center"
              iconType="square"
              wrapperStyle={{
                paddingTop: '24px',
                fontSize: '12px',
                color: '#97a2ab',
              }}
              payload={STATUS_SERIES.map((status) => ({
                value: status.label,
                type: 'square' as const,
                color: STATUS_COLORS[status.key],
                id: status.key,
              }))}
              formatter={(value) => (
                <span style={{ color: '#97a2ab' }}>{value}</span>
              )}
            />
            {teams.flatMap((team) =>
              STATUS_SERIES.map((status) => (
                <Bar
                  key={`${team}-${status.key}`}
                  dataKey={openTicketsBarDataKey(team, status.key)}
                  name={status.label}
                  stackId={team}
                  fill={STATUS_COLORS[status.key]}
                  legendType="none"
                  radius={[0, 0, 0, 0]}
                />
              )),
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function ChartHeaderBlock({
  granularity,
  onGranularityChange,
  isLoading,
}: {
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
        Chamados em aberto com cada equipe
      </h2>
      <DemandVolumeChartGranularity
        value={granularity}
        onChange={onGranularityChange}
        disabled={isLoading}
      />
    </div>
  )
}

function ChartMessage({ message }: { message: string }) {
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
      {message}
    </div>
  )
}
