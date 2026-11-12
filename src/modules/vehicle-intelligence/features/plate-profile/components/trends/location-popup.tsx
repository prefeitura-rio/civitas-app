import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts3'

import {
  fillDaily,
  formatCoords,
} from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-format'
import type { CirclePoint } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/circulation-map'
import { ProfileHeatmap } from '@/modules/vehicle-intelligence/features/plate-profile/components/trends/profile-heatmap'
import { monthTicks } from '@/modules/vehicle-intelligence/features/plate-profile/profile-format'
import {
  formatDayMonth,
  formatInBrasilia,
} from '@/modules/vehicle-intelligence/lib/dates'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import type { PlateProfileLocation } from '@/modules/vehicle-intelligence/types/domain'

export function LocationPopup({
  point,
  periodDays = [],
}: {
  point: CirclePoint &
    Pick<PlateProfileLocation, 'daily' | 'weekday_hour_heatmap'>
  periodDays?: string[]
}) {
  const daily = useMemo(
    () => fillDaily(point.daily, periodDays),
    [point.daily, periodDays],
  )
  const ticks = useMemo(() => monthTicks(daily), [daily])
  const activeDays = useMemo(
    () => daily.reduce((count, item) => count + (item.count > 0 ? 1 : 0), 0),
    [daily],
  )
  const coords = formatCoords(point.latitude, point.longitude)
  const heatmap = point.weekday_hour_heatmap || [[0]]
  return (
    <div className="profile-radar-popup">
      <div className="profile-radar-popup-header">
        <div>
          <span className="profile-radar-popup-kicker">
            PONTO DE COLETA {point.id}
          </span>
          <strong>{point.label}</strong>
          <small>
            {point.sublabel && (
              <span className="profile-radar-popup-place">
                {point.sublabel}
              </span>
            )}
            {coords && (
              <span className="profile-radar-popup-coords">
                Lat/Lon {coords}
              </span>
            )}
          </small>
        </div>
        <b>
          {formatNumber(point.detections)}
          <em>detecções</em>
        </b>
      </div>
      <div className="profile-radar-popup-visuals">
        <div className="profile-radar-popup-panel">
          <span className="profile-radar-popup-section">Série diária</span>
          <div className="profile-radar-popup-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={daily}
                margin={{ top: 8, right: 10, left: 2, bottom: 16 }}
              >
                <defs>
                  <linearGradient
                    id={`radar-series-${point.id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#20d6ff" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#20d6ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,.08)"
                />
                <XAxis
                  dataKey="day"
                  height={34}
                  ticks={ticks.length ? ticks : undefined}
                  interval={ticks.length ? 0 : 'preserveStartEnd'}
                  minTickGap={ticks.length ? undefined : 38}
                  tickFormatter={(value) => formatDayMonth(String(value))}
                  tick={{ fill: '#8fa4aa', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,.12)' }}
                  tickLine={false}
                  label={{
                    value: 'Dia',
                    position: 'insideBottom',
                    offset: -1,
                    fill: '#73888e',
                    fontSize: 10,
                  }}
                />
                <YAxis
                  width={38}
                  tickCount={4}
                  allowDecimals={false}
                  tick={{ fill: '#8fa4aa', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    background: '#151a1a',
                    border: '1px solid rgba(255,255,255,.16)',
                    borderRadius: 8,
                    color: '#eef3f4',
                    fontSize: 12,
                    padding: '8px 10px',
                  }}
                  labelStyle={{
                    color: '#eef3f4',
                    fontSize: 12,
                    marginBottom: 3,
                  }}
                  labelFormatter={(value) =>
                    formatInBrasilia(String(value), {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  }
                  formatter={(value) => [
                    formatNumber(Number(value)),
                    'Detecções',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#20d6ff"
                  strokeWidth={1.6}
                  fill={`url(#radar-series-${point.id})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <small className="profile-radar-popup-note">
            {formatNumber(activeDays)} de {formatNumber(daily.length)} dias com
            passagem neste radar
          </small>
        </div>
        <div className="profile-radar-popup-panel">
          <span className="profile-radar-popup-section">
            Heatmap hora × dia
          </span>
          <ProfileHeatmap matrix={heatmap} />
        </div>
      </div>
    </div>
  )
}
