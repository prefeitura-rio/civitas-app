import { Check, Search } from 'lucide-react'
import { useState } from 'react'

import {
  foldAccents,
  toggle,
} from '@/modules/vehicle-intelligence/components/filters/filter-options'
import { FilterPill } from '@/modules/vehicle-intelligence/components/filters/filter-pill'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'

/** Seleção múltipla (alvo, autor, tipo de veículo, CISP); vazio é "Todos". */
export function MultiPill({
  label,
  options,
  selected,
  onChange,
  allLabel = 'Todos',
  labelFor = categoryLabel,
  searchable = false,
}: {
  label: string
  options: Array<{ value: string; label?: string; hint?: string }>
  selected: string[]
  onChange: (value: string[]) => void
  allLabel?: string
  labelFor?: (value: string) => string
  searchable?: boolean
}) {
  const [search, setSearch] = useState('')
  const text = (item: { value: string; label?: string }) =>
    item.label ?? labelFor(item.value)
  const visible =
    searchable && search
      ? options.filter((item) =>
          foldAccents(
            `${item.value} ${text(item)} ${item.hint ?? ''}`,
          ).includes(foldAccents(search)),
        )
      : options
  const display =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? text(
            options.find((item) => item.value === selected[0]) ?? {
              value: selected[0],
            },
          )
        : `${selected.length} selecionados`
  return (
    <FilterPill label={label} value={display} menuClassName="multi-menu">
      {searchable && (
        <label className="filter-pill-search">
          <Search size={14} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Buscar ${label.toLowerCase()}`}
          />
        </label>
      )}
      <div className="filter-pill-actions">
        <button type="button" onClick={() => onChange([])}>
          Usar {allLabel.toLowerCase()}
        </button>
        <span>
          {selected.length ? `${selected.length} no recorte` : 'Sem restrição'}
        </span>
      </div>
      <div className="filter-pill-options">
        {visible.map((item) => {
          const active = selected.includes(item.value)
          return (
            <button
              type="button"
              key={item.value}
              className={active ? 'selected' : ''}
              aria-pressed={active}
              onClick={() => onChange(toggle(selected, item.value))}
            >
              <span className="checkbox">{active && <Check size={12} />}</span>
              <span>
                {text(item)}
                {item.hint && <small>{item.hint}</small>}
              </span>
            </button>
          )
        })}
        {!visible.length && (
          <p className="filter-pill-empty">Nada encontrado.</p>
        )}
      </div>
    </FilterPill>
  )
}
