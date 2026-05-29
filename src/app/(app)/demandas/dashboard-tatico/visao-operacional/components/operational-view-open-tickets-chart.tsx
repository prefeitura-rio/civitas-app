'use client'

import { type CSSProperties, useMemo } from 'react'
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

import type { OpenTicketsByTeamItemOut } from '@/http/tickets/get-operational-view'

import {
  getOpenTicketsStatusSeries,
  type OpenTicketsTeamBarPoint,
} from './operational-view-chart-utils'

interface OperationalViewOpenTicketsChartProps {
  chartData: OpenTicketsTeamBarPoint[]
  openTicketsByTeam?: OpenTicketsByTeamItemOut[]
  isLoading: boolean
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
  openTicketsByTeam,
  isLoading,
}: OperationalViewOpenTicketsChartProps) {
  const statusSeries = useMemo(
    () => getOpenTicketsStatusSeries(openTicketsByTeam),
    [openTicketsByTeam],
  )

  return (
    <div style={CHART_SHELL}>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#f9fafa',
          margin: 0,
          marginBottom: '24px',
        }}
      >
        Chamados em aberto com cada equipe
      </h2>

      {isLoading && chartData.length === 0 ? (
        <ChartMessage message="Carregando…" />
      ) : chartData.length === 0 ? (
        <ChartMessage message="Nenhum dado disponível" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
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
                const status = statusSeries.find(
                  (s) => s.key === String(item.dataKey ?? ''),
                )
                const numeric =
                  typeof value === 'number' ? value : Number(value ?? 0)
                return [numeric.toLocaleString('pt-BR'), status?.label]
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
              formatter={(value) => (
                <span style={{ color: '#97a2ab' }}>{value}</span>
              )}
            />
            {statusSeries.map((status) => (
              <Bar
                key={status.key}
                dataKey={status.key}
                name={status.label}
                stackId="open_tickets"
                fill={status.color}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
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
