'use client'

import { useQuery } from '@tanstack/react-query'
import { ChevronDown, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import type { SearchOption } from '@/http/tickets/tickets-dashboard-filters'
import { cn } from '@/lib/utils'

import styles from './dashboard-tatico-filter-modal.module.css'
import type { DashboardTaticoFilterScope } from './types'
import { useDebouncedValue } from './use-debounced-value'

export type DashboardTaticoSearchMultiSelectProps = {
  scope: DashboardTaticoFilterScope
  label: string
  placeholder?: string
  value: SearchOption[]
  onChange: (value: SearchOption[]) => void
  searchFn?: (search: string) => Promise<SearchOption[]>
  staticOptions?: SearchOption[]
  optionsLoading?: boolean
  minCharsMessage?: string
}

export function DashboardTaticoSearchMultiSelect({
  scope,
  label,
  placeholder = 'Selecione',
  value,
  onChange,
  searchFn,
  staticOptions,
  optionsLoading,
  minCharsMessage = 'Digite ao menos 2 caracteres',
}: DashboardTaticoSearchMultiSelectProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 350)

  const { data, isFetching } = useQuery({
    queryKey: ['dashboard-tatico-filter-search', scope, label, debouncedSearch],
    queryFn: () => searchFn!(debouncedSearch),
    enabled:
      isOpen &&
      !staticOptions &&
      Boolean(searchFn) &&
      debouncedSearch.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  })

  const selectedValues = useMemo(
    () => new Set(value.map((item) => item.value)),
    [value],
  )

  const staticFiltered = useMemo(() => {
    if (!staticOptions) return []
    const q = debouncedSearch.trim().toLowerCase()
    return staticOptions.filter(
      (item) =>
        !selectedValues.has(item.value) &&
        (q === '' ||
          item.label.toLowerCase().includes(q) ||
          item.value.toLowerCase().includes(q)),
    )
  }, [staticOptions, debouncedSearch, selectedValues])

  const options = useMemo(() => {
    if (staticOptions) return staticFiltered
    return (data ?? []).filter((item) => !selectedValues.has(item.value))
  }, [staticOptions, staticFiltered, data, selectedValues])

  const removeItem = (itemValue: string) => {
    onChange(value.filter((item) => item.value !== itemValue))
  }

  const addItem = (item: SearchOption) => {
    onChange([...value, item])
    setSearch('')
  }

  const dropdownBody = optionsLoading ? (
    <div className={styles.dropdownHint}>Buscando...</div>
  ) : !staticOptions && debouncedSearch.trim().length < 2 ? (
    <div className={styles.dropdownHint}>{minCharsMessage}</div>
  ) : isFetching ? (
    <div className={styles.dropdownHint}>Buscando...</div>
  ) : options.length === 0 ? (
    <div className={styles.dropdownHint}>Nenhum resultado encontrado</div>
  ) : (
    options.map((item) => (
      <button
        key={item.value}
        type="button"
        className={styles.dropdownOption}
        onClick={() => addItem(item)}
      >
        {item.label}
      </button>
    ))
  )

  return (
    <div className={styles.filterBlock}>
      <span className={styles.filterLabel}>{label}</span>

      <Popover open={isOpen} onOpenChange={setIsOpen} modal>
        <div className={styles.multiSelectBox}>
          <PopoverAnchor asChild>
            <div className={styles.multiSelectInputWrapper}>
              <input
                value={search}
                onFocus={() => setIsOpen(true)}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setIsOpen(true)
                }}
                placeholder={value.length > 0 ? '' : placeholder}
                className={styles.multiSelectInput}
                aria-haspopup="listbox"
                autoComplete="off"
              />
              <ChevronDown className={styles.multiSelectChevron} size={16} />
            </div>
          </PopoverAnchor>

          <PopoverContent
            align="start"
            sideOffset={4}
            className={cn(
              styles.multiSelectDropdown,
              'z-[100] w-[var(--radix-popover-trigger-width)] p-0',
            )}
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            {dropdownBody}
          </PopoverContent>
        </div>
      </Popover>

      {value.length > 0 ? (
        <div className={styles.selectedChips}>
          {value.map((item) => (
            <span key={item.value} className={styles.selectedChip}>
              {item.label}
              <button
                type="button"
                className={styles.selectedChipRemove}
                onClick={() => removeItem(item.value)}
                aria-label={`Remover ${item.label}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
