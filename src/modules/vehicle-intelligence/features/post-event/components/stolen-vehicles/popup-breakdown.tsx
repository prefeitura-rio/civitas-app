import type { BreakdownItem } from '@/modules/vehicle-intelligence/features/post-event/components/stolen-vehicles/clusters'

export function PopupBreakdown({ items }: { items: BreakdownItem[] }) {
  if (!items.length) return <small>Não informado</small>
  return items.map((item) => (
    <div key={item.key}>
      <span>{item.label}</span>
      <i>
        <em style={{ width: `${item.percentage}%` }} />
      </i>
      <b>{item.percentage}%</b>
    </div>
  ))
}
