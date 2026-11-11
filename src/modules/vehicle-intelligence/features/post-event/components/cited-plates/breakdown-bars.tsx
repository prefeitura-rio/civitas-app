import type { Breakdown } from '@/modules/vehicle-intelligence/features/post-event/types'
import { formatPercent } from '@/modules/vehicle-intelligence/lib/format'

export function BreakdownBars({
  items,
  label,
}: {
  items: Breakdown[]
  label?: (value: string) => string
}) {
  if (!items.length)
    return <small className="detail-empty">Não informado</small>
  return (
    <div className="detail-breakdown">
      {items.map((item) => (
        <div key={item.label}>
          <span title={label ? label(item.label) : item.label}>
            {label ? label(item.label) : item.label}
          </span>
          <i>
            <em style={{ width: `${item.percentage}%` }} />
          </i>
          <b>{formatPercent(item.percentage, 3)}</b>
        </div>
      ))}
    </div>
  )
}
