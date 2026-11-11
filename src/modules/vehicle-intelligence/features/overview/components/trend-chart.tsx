import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts3'

import { Panel } from '@/modules/vehicle-intelligence/components/panel'
import { PanelHeader } from '@/modules/vehicle-intelligence/components/panel-header'
import { Badge } from '@/modules/vehicle-intelligence/components/ui/badge'
import { TOOLTIP_STYLE } from '@/modules/vehicle-intelligence/features/overview/components/chart-style'
import {
  brasiliaFormatter,
  parseInstant,
} from '@/modules/vehicle-intelligence/lib/dates'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { DashboardData } from '@/modules/vehicle-intelligence/types/domain'

const monthFormatter = brasiliaFormatter({ month: 'short' })

export function TrendChart({ data }: { data: DashboardData }) {
  const series = data.serie_mensal.map((item) => ({
    ...item,
    label: monthFormatter
      .format(parseInstant(`${item.mes}-02`))
      .replace('.', '')
      .toUpperCase(),
  }))
  const [startYear, startMonth, startDay] =
    data.metadata.periodo_inicio.split('-')
  const [endYear, endMonth, endDay] = data.metadata.periodo_fim.split('-')
  const description = `Fatos de ${startDay}/${startMonth}/${startYear} a ${endDay}/${endMonth}/${endYear}; o primeiro e o último mês podem estar incompletos.`
  return (
    <Panel className="trend-panel">
      <PanelHeader
        compact
        eyebrow="Evolução mensal"
        title="Dinâmica das ocorrências"
        description={description}
        action={
          data.metadata.ultimo_mes_parcial ? (
            <Badge variant="outline" className="partial-badge">
              MÊS PARCIAL
            </Badge>
          ) : undefined
        }
      />
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            accessibilityLayer
            data={series}
            margin={{ top: 15, right: 12, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00b4e8" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#00b4e8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9fb4ba', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9fb4ba', fontSize: 11.5 }}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [
                formatNumber(Number(value)),
                'Ocorrências',
              ]}
            />
            <Area
              type="monotone"
              dataKey="ocorrencias"
              stroke="#20d6ff"
              strokeWidth={2.3}
              fill="url(#trend)"
              dot={{ fill: '#20d6ff', stroke: '#151a1a', strokeWidth: 2, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        Série mensal:{' '}
        {series
          .map((item) => `${item.label}: ${formatNumber(item.ocorrencias)}`)
          .join('; ')}
        .
      </p>
    </Panel>
  )
}
