import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts3'

import { Panel } from '@/modules/vehicle-intelligence/components/panel'
import { PanelHeader } from '@/modules/vehicle-intelligence/components/panel-header'
import { TOOLTIP_STYLE } from '@/modules/vehicle-intelligence/features/overview/components/chart-style'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import type { DashboardData } from '@/modules/vehicle-intelligence/types/domain'

/** Área foco: como o autor chegou; território estadual: o perfil dos veículos subtraídos. */
export function TargetChart({ data }: { data: DashboardData }) {
  const byMode = Boolean(data.deslocamentos?.length)
  const rows = (byMode ? data.deslocamentos! : data.alvos)
    .filter((item) => item.selected !== false)
    .slice(0, 6)
    .map((item) => ({ ...item, short: categoryLabel(item.categoria) }))
  const targets = byMode
    ? data.alvos
        .map(
          (item) =>
            `${categoryLabel(item.categoria)} ${formatNumber(item.ocorrencias)}`,
        )
        .join(' · ')
    : ''
  return (
    <Panel className="target-panel">
      {byMode ? (
        <PanelHeader
          compact
          eyebrow="Deslocamento do autor"
          title="Como o autor chegou e fugiu"
          description={targets ? `Alvo: ${targets}` : undefined}
        />
      ) : (
        <PanelHeader
          compact
          eyebrow="Tipo de alvo"
          title="Perfil dos veículos"
        />
      )}
      <div className="target-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            accessibilityLayer
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: 34, left: 24, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="short"
              axisLine={false}
              tickLine={false}
              width={128}
              tick={{ fill: '#c3d3d7', fontSize: 12.5 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,.025)' }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [
                formatNumber(Number(value)),
                'Ocorrências',
              ]}
            />
            <Bar
              dataKey="ocorrencias"
              fill="#00a9d9"
              radius={[0, 5, 5, 0]}
              barSize={13}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        Ocorrências por {byMode ? 'deslocamento do autor' : 'tipo de veículo'}:{' '}
        {rows
          .map((item) => `${item.short}: ${formatNumber(item.ocorrencias)}`)
          .join('; ')}
        .
      </p>
    </Panel>
  )
}
