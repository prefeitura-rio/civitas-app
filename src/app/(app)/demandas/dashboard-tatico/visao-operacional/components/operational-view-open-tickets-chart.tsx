'use client'

import { type CSSProperties, useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { OpenTicketsByTeamItemOut } from '@/http/tickets/get-operational-view'

import { DashboardTaticoDataState } from '../../components/dashboard-tatico-data-state'
import {
  getOpenTicketsStatusSeries,
  type OpenTicketsTeamBarPoint,
} from './operational-view-chart-utils'

interface OperationalViewOpenTicketsChartProps {
  chartData: OpenTicketsTeamBarPoint[]
  openTicketsByTeam?:
    | OpenTicketsByTeamItemOut[]
    | { items?: OpenTicketsByTeamItemOut[] | null }
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

  if (!isLoading && openTicketsByTeam == null) {
    return null
  }

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
        Chamados em aberto por equipe
      </h2>

      {chartData.length === 0 ? (
        <DashboardTaticoDataState isLoading={isLoading} isEmpty />
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
            {statusSeries.map((status, idx) => (
              <Bar
                key={status.key}
                dataKey={status.key}
                name={status.label}
                stackId="open_tickets"
                fill={status.color}
                radius={[0, 0, 0, 0]}
              >
                <LabelList
                  dataKey={status.key}
                  position="inside"
                  formatter={(v: unknown) => {
                    const n = Number(v)
                    return n > 0 ? String(n) : ''
                  }}
                  style={{ fontSize: 10, fill: '#f9fafa', fontWeight: 600 }}
                />
                {idx === statusSeries.length - 1 && (
                  <LabelList
                    dataKey={status.key}
                    position="top"
                    content={(props) => {
                      const { x, y, width, index } = props as {
                        x?: number
                        y?: number
                        width?: number
                        index?: number
                      }
                      if (
                        x == null ||
                        y == null ||
                        width == null ||
                        index == null
                      )
                        return null
                      const rowValues = statusSeries.map((s) => {
                        const val = ((
                          props as { payload?: Record<string, unknown> }
                        ).payload ?? {})[s.key]
                        return typeof val === 'number' ? val : 0
                      })
                      const total = rowValues.reduce((a, b) => a + b, 0)
                      if (total === 0) return null
                      return (
                        <text
                          x={Number(x) + Number(width) / 2}
                          y={Number(y) - 6}
                          textAnchor="middle"
                          fill="#97a2ab"
                          fontSize={10}
                          fontWeight={600}
                        >
                          {total}
                        </text>
                      )
                    }}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
