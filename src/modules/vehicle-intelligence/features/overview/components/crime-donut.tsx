import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts3'

import { Panel } from '@/modules/vehicle-intelligence/components/panel'
import { PanelHeader } from '@/modules/vehicle-intelligence/components/panel-header'
import { TOOLTIP_STYLE } from '@/modules/vehicle-intelligence/features/overview/components/chart-style'
import { OVERVIEW } from '@/modules/vehicle-intelligence/features/overview/overview-variants'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { DashboardData } from '@/modules/vehicle-intelligence/types/domain'

const DONUT_COLUMNS = OVERVIEW.columns.filter((column) => !column.secondary)

export function CrimeDonut({ data }: { data: DashboardData }) {
  const colors = ['#db5b5b', '#d99a2b']
  const crimes = DONUT_COLUMNS.flatMap((column) =>
    data.crimes
      .filter((item) => item.tipo === column.crimeType)
      .map((item) => ({ ...item, label: column.label })),
  )
  return (
    <Panel className="compact-panel">
      <PanelHeader compact eyebrow="Modalidade" title={OVERVIEW.donutTitle} />
      <div className="donut-layout">
        <div className="donut-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer>
              <Pie
                data={crimes}
                dataKey="ocorrencias"
                nameKey="label"
                innerRadius={55}
                outerRadius={78}
                paddingAngle={3}
                stroke="none"
              >
                {crimes.map((item, index) => (
                  <Cell key={item.tipo} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => formatNumber(Number(value))}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <strong>{formatNumber(data.summary.total)}</strong>
            <span>total</span>
          </div>
        </div>
        <div className="donut-legend">
          {crimes.map((item, index) => (
            <div key={item.tipo}>
              <i style={{ background: colors[index] }}></i>
              <span>{item.label}</span>
              <strong>{formatNumber(item.ocorrencias)}</strong>
            </div>
          ))}
        </div>
        <p className="sr-only">
          Distribuição por modalidade:{' '}
          {crimes
            .map(
              (item) =>
                `${item.label.toLowerCase()}: ${formatNumber(item.ocorrencias)}`,
            )
            .join('; ')}
          .
        </p>
      </div>
    </Panel>
  )
}
