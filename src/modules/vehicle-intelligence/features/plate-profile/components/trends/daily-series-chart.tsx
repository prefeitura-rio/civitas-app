import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts3'

import { monthTicks } from '@/modules/vehicle-intelligence/features/plate-profile/profile-format'
import {
  formatDate,
  formatDayMonth,
  formatInBrasilia,
} from '@/modules/vehicle-intelligence/lib/dates'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

export function DailySeriesChart({
  series,
  occurrenceDays,
}: {
  series: Array<{ day: string; detections: number }>
  occurrenceDays: string[]
}) {
  const ticks = useMemo(() => monthTicks(series), [series])
  const stats = useMemo(() => {
    let peak = 0
    let peakDay: string | null = null
    let silentDays = 0
    for (const point of series) {
      if (point.detections === 0) silentDays += 1
      if (point.detections > peak) {
        peak = point.detections
        peakDay = point.day
      }
    }
    return { peak, peakDay, silentDays }
  }, [series])
  return (
    <div className="profile-series-wrap">
      <div className="profile-series-facts">
        <span>
          <b>{formatNumber(series.length)}</b> dias no período
        </span>
        <span>
          <b>{formatNumber(stats.peak)}</b> passagens no pico
          {stats.peakDay ? ` · ${formatDate(stats.peakDay)}` : ''}
        </span>
        <span>
          <b>{formatNumber(stats.silentDays)}</b> dias sem nenhuma leitura
        </span>
      </div>
      <div className="profile-series-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={series}
            margin={{ top: 12, right: 18, left: 6, bottom: 24 }}
          >
            <defs>
              <linearGradient id="profile-series" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#20d6ff" stopOpacity={0.42} />
                <stop offset="100%" stopColor="#20d6ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,.07)" />
            <XAxis
              dataKey="day"
              ticks={ticks}
              interval={0}
              tickFormatter={(day) => formatDayMonth(String(day))}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,.12)' }}
              height={44}
              tick={{ fill: '#8fa4aa', fontSize: 12 }}
              label={{
                value: 'Dia',
                position: 'insideBottom',
                offset: -2,
                fill: '#73888e',
                fontSize: 12,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={62}
              allowDecimals={false}
              tick={{ fill: '#8fa4aa', fontSize: 12 }}
              label={{
                value: 'Detecções no dia',
                angle: -90,
                position: 'insideLeft',
                offset: 4,
                style: { textAnchor: 'middle', fill: '#73888e', fontSize: 12 },
              }}
            />
            <RechartsTooltip
              contentStyle={{
                background: '#151a1a',
                border: '1px solid rgba(255,255,255,.16)',
                borderRadius: 10,
                color: '#eef3f4',
                fontSize: 13,
                padding: '10px 12px',
              }}
              labelStyle={{ color: '#eef3f4', fontSize: 13, marginBottom: 4 }}
              labelFormatter={(day) =>
                `${formatInBrasilia(String(day), { day: '2-digit', month: 'long', year: 'numeric' })}${occurrenceDays.includes(String(day)) ? ' · dia com ocorrência' : ''}`
              }
              formatter={(value) => [formatNumber(Number(value)), 'Detecções']}
            />
            {occurrenceDays.map((day) => (
              <ReferenceLine
                key={day}
                x={day}
                stroke="#db5b5b"
                strokeWidth={1.4}
                strokeOpacity={0.8}
              />
            ))}
            <Area
              type="monotone"
              dataKey="detections"
              stroke="#20d6ff"
              strokeWidth={2}
              fill="url(#profile-series)"
              dot={false}
              activeDot={{
                r: 4,
                fill: '#20d6ff',
                stroke: '#151a1a',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="profile-series-legend">
        <span>
          <i className="series-line" />
          Passagens por dia
        </span>
        <span>
          <i className="series-event" />
          Dia com ocorrência
        </span>
        <span>
          <i className="series-zero" />
          Vale em zero: nenhuma leitura registrada
        </span>
      </div>
    </div>
  )
}
