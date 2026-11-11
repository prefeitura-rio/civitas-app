import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { toggle } from '@/modules/vehicle-intelligence/components/filters/filter-options'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/modules/vehicle-intelligence/components/ui/popover'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'

export function CategoryFilter({
  label,
  options,
  selected,
  onChange,
  compact = false,
  defaultOpen = false,
  unified = false,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (value: string[]) => void
  compact?: boolean
  defaultOpen?: boolean
  unified?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  if (!compact) {
    if (unified) {
      return (
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[0.625rem] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            {label} · seleção múltipla
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              size="sm"
              variant={selected.length === 0 ? 'secondary' : 'outline'}
              aria-pressed={selected.length === 0}
              className="shrink-0 px-3 text-xs shadow-none"
              onClick={() => onChange([])}
            >
              Todos
            </Button>
            {options.map((target) => {
              const active = selected.includes(target)
              return (
                <Button
                  type="button"
                  size="sm"
                  variant={active ? 'secondary' : 'outline'}
                  key={target}
                  aria-pressed={active}
                  className="shrink-0 px-3 text-xs shadow-none"
                  onClick={() => onChange(toggle(selected, target))}
                >
                  {categoryLabel(target)}
                </Button>
              )
            })}
          </div>
        </div>
      )
    }
    return (
      <div className="filter-group target-filter">
        <span>{label} · seleção múltipla</span>
        <div className="target-chips">
          <Button
            type="button"
            variant="outline"
            aria-pressed={selected.length === 0}
            className={
              selected.length === 0 ? 'active all-targets' : 'all-targets'
            }
            onClick={() => onChange([])}
          >
            Todos
          </Button>
          {options.map((target) => (
            <Button
              type="button"
              variant="outline"
              key={target}
              aria-pressed={selected.includes(target)}
              className={selected.includes(target) ? 'active' : ''}
              onClick={() => onChange(toggle(selected, target))}
            >
              {categoryLabel(target)}
            </Button>
          ))}
        </div>
      </div>
    )
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="cisp-select vehicle-type-select">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="select-trigger"
            aria-label={`Selecionar ${label.toLowerCase()}`}
          >
            <span>
              <small>{label.toUpperCase()}</small>
              <strong>
                {selected.length === 1
                  ? categoryLabel(selected[0])
                  : selected.length
                    ? `${selected.length} selecionados`
                    : 'Todos'}
              </strong>
            </span>
            <ChevronDown size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={7}
          className="select-menu w-[min(350px,calc(100vw-24px))]"
        >
          <div className="select-actions">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
            >
              Usar todos
            </Button>
            <span>
              {selected.length
                ? `${selected.length} no recorte`
                : 'Sem restrição'}
            </span>
          </div>
          <div className="select-list">
            {options.map((target) => {
              const active = selected.includes(target)
              return (
                <Button
                  type="button"
                  variant="ghost"
                  key={target}
                  className={active ? 'selected' : ''}
                  aria-pressed={active}
                  onClick={() => onChange(toggle(selected, target))}
                >
                  <span className="checkbox">
                    {active && <Check size={13} />}
                  </span>
                  <span className="cisp-copy single-line">
                    <strong>{categoryLabel(target)}</strong>
                  </span>
                </Button>
              )
            })}
          </div>
          <Button
            type="button"
            className="select-done"
            onClick={() => setOpen(false)}
          >
            Aplicar seleção
          </Button>
        </PopoverContent>
      </div>
    </Popover>
  )
}
