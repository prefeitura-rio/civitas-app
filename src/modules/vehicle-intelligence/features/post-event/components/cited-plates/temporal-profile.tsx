import { BreakdownBars } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/breakdown-bars'
import { DetailSection } from '@/modules/vehicle-intelligence/features/post-event/components/cited-plates/detail-section'
import { hourInBrasilia } from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'

export function TemporalProfile({ values }: { values: Array<string | null> }) {
  const hourly = Array.from({ length: 24 }, () => 0)
  values.forEach((value) => {
    const hour = hourInBrasilia(value)
    if (hour !== null) hourly[hour] += 1
  })
  const total = hourly.reduce((sum, count) => sum + count, 0)
  if (!total) return null
  const peak = Math.max(...hourly)
  const typical = hourly.indexOf(peak)
  const shifts = [
    [0, 6, 'Madrugada · 0–5h'],
    [6, 12, 'Manhã · 6–11h'],
    [12, 18, 'Tarde · 12–17h'],
    [18, 24, 'Noite · 18–23h'],
  ] as const
  return (
    <DetailSection
      title="Distribuição dos horários"
      hint={`${formatNumber(total)} com horário`}
    >
      <div className="detail-typical-time">
        <span>Horário típico</span>
        <strong>
          {String(typical).padStart(2, '0')}h–
          {String((typical + 1) % 24).padStart(2, '0')}h
        </strong>
        <small>
          {pluralize(peak, 'ocorrência', 'ocorrências')} ·{' '}
          {Math.round((1000 * peak) / total) / 10}% dos horários
        </small>
      </div>
      <BreakdownBars
        items={shifts.map(([start, end, label]) => {
          const count = hourly
            .slice(start, end)
            .reduce((sum, value) => sum + value, 0)
          return {
            label,
            count,
            percentage: Math.round((1000 * count) / total) / 10,
          }
        })}
      />
    </DetailSection>
  )
}
