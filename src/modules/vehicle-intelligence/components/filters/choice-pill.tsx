import { Check } from 'lucide-react'

import { FilterPill } from '@/modules/vehicle-intelligence/components/filters/filter-pill'

/** Escolha única (tipo do fato, natureza). */
export function ChoicePill({
  label,
  value,
  items,
  onChange,
}: {
  label: string
  value: string
  items: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <FilterPill
      label={label}
      value={items.find((item) => item.value === value)?.label ?? 'Todos'}
    >
      {(close) => (
        <div className="filter-pill-options">
          {items.map((item) => (
            <button
              type="button"
              key={item.value}
              className={item.value === value ? 'selected' : ''}
              onClick={() => {
                onChange(item.value)
                close()
              }}
            >
              <span>{item.label}</span>
              {item.value === value ? <Check size={14} /> : <i />}
            </button>
          ))}
        </div>
      )}
    </FilterPill>
  )
}
