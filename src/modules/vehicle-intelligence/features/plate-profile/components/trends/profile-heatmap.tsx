import type { CSSProperties } from 'react'

import { weekdayLong } from '@/modules/vehicle-intelligence/features/plate-profile/shifts'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'

const weekdayShort = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export function ProfileHeatmap({ matrix }: { matrix: number[][] }) {
  const max = Math.max(1, ...matrix.flat())
  const hours = Array.from({ length: 24 }, (_, hour) => hour)
  let peakWeekday = 0
  let peakHour = 0
  matrix.forEach((row, weekday) =>
    row.forEach((count, hour) => {
      if (count > (matrix[peakWeekday]?.[peakHour] ?? 0)) {
        peakWeekday = weekday
        peakHour = hour
      }
    }),
  )
  return (
    <div
      className="profile-heatmap"
      role="img"
      aria-label="Mapa de calor de detecções por hora do dia e dia da semana"
    >
      <div className="profile-heatmap-grid">
        <div className="hm-corner" />
        {weekdayShort.map((day) => (
          <div className="hm-colhead" key={day}>
            {day}
          </div>
        ))}
        {hours.map((hour) => (
          <div className="hm-row" key={hour} style={{ display: 'contents' }}>
            <div className="hm-rowhead">{String(hour).padStart(2, '0')}h</div>
            {weekdayShort.map((_, weekday) => {
              const count = matrix[weekday]?.[hour] ?? 0
              const intensity = count / max
              return (
                <div
                  key={weekday}
                  className={`hm-cell${intensity > 0.55 ? ' strong' : ''}`}
                  style={
                    {
                      '--cell': `rgba(56,189,248,${(0.1 + intensity * 0.9).toFixed(3)})`,
                    } as CSSProperties
                  }
                  title={`${weekdayLong[weekday]} · ${String(hour).padStart(2, '0')}h · ${formatNumber(count)} detecções`}
                >
                  <span>{formatNumber(count)}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="profile-heatmap-scale">
        <span>Menos</span>
        <i />
        <span>Mais</span>
        <em>
          Pico: {weekdayShort[peakWeekday].toLowerCase()},{' '}
          {String(peakHour).padStart(2, '0')}h–
          {String((peakHour + 1) % 24).padStart(2, '0')}h
        </em>
      </div>
    </div>
  )
}
