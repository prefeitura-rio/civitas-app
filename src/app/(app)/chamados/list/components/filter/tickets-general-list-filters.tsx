'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon, ChevronDown, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { type DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getTeamsList } from '@/http/teams/get-teams'
import {
  searchOperations,
  type SearchOption,
  searchRequesters,
} from '@/http/tickets/tickets-dashboard-filters'
import { dateConfig } from '@/lib/date-config'

import styles from './tickets-general-list-filters.module.css'

export type FilterFormState = {
  tipo_chamado_id: SearchOption[]
  numero_interno: SearchOption[]
  numero_procedimento: SearchOption[]
  numero_oficio: SearchOption[]
  natureza_id: SearchOption[]
  demandante_id: SearchOption[]
  requisitante: SearchOption[]
  ponto_focal: SearchOption[]

  data_base_inicio: string
  data_base_fim: string
  data_entrada_inicio: string
  data_entrada_fim: string

  status: string[]
  prioridade: SearchOption[]
  equipe: SearchOption[]
  servicos_realizados: string[]
}

const priorityOptions = ['URGENTE', 'ALTA', 'ROTINA', 'SEM PRIORIDADE']

export function emptyFilters(): FilterFormState {
  return {
    tipo_chamado_id: [],
    numero_interno: [],
    numero_procedimento: [],
    numero_oficio: [],
    natureza_id: [],
    demandante_id: [],
    requisitante: [],
    ponto_focal: [],

    data_base_inicio: '',
    data_base_fim: '',
    data_entrada_inicio: '',
    data_entrada_fim: '',

    status: [],
    prioridade: [],
    equipe: [],
    servicos_realizados: [],
  }
}

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const prioritySearchOptions: SearchOption[] = priorityOptions.map((p) => ({
  value: p,
  label: formatLabel(p),
}))

function SearchMultiSelect({
  label,
  placeholder = 'Selecione',
  value,
  onChange,
  searchFn,
  staticOptions,
  optionsLoading,
  minCharsMessage = 'Digite ao menos 2 caracteres',
}: {
  label: string
  placeholder?: string
  value: SearchOption[]
  onChange: (value: SearchOption[]) => void
  searchFn?: (search: string) => Promise<SearchOption[]>
  staticOptions?: SearchOption[]
  optionsLoading?: boolean
  minCharsMessage?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 350)

  const { data, isFetching } = useQuery({
    queryKey: ['dashboard-filter-search', label, debouncedSearch],
    queryFn: () => searchFn!(debouncedSearch),
    enabled:
      isOpen &&
      !staticOptions &&
      Boolean(searchFn) &&
      debouncedSearch.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  return (
    <div className={styles.filterBlock} ref={containerRef}>
      <span className={styles.filterLabel}>{label}</span>

      <div className={styles.multiSelectBox}>
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
          />

          <ChevronDown className={styles.multiSelectChevron} size={16} />

          {isOpen ? (
            <div className={styles.multiSelectDropdown}>
              {optionsLoading ? (
                <div className={styles.dropdownHint}>Buscando...</div>
              ) : !staticOptions && debouncedSearch.trim().length < 2 ? (
                <div className={styles.dropdownHint}>{minCharsMessage}</div>
              ) : isFetching ? (
                <div className={styles.dropdownHint}>Buscando...</div>
              ) : options.length === 0 ? (
                <div className={styles.dropdownHint}>
                  Nenhum resultado encontrado
                </div>
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
              )}
            </div>
          ) : null}
        </div>

        {value.length > 0 ? (
          <div className={styles.selectedChips}>
            {value.map((item) => (
              <span key={item.value} className={styles.selectedChip}>
                {item.label}
                <button
                  type="button"
                  className={styles.selectedChipRemove}
                  onClick={() => removeItem(item.value)}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function parseDateString(s: string): Date | undefined {
  if (!s?.trim()) return undefined
  const d = new Date(s + 'T00:00:00')
  return Number.isNaN(d.getTime()) ? undefined : d
}

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function normalizeRange(range: DateRange | undefined): DateRange | undefined {
  if (!range?.from) return undefined
  const from = new Date(range.from)
  const to = range.to ? new Date(range.to) : undefined
  if (!to) return { from, to: undefined }
  if (from.getTime() > to.getTime()) {
    return { from: to, to: from }
  }
  return { from, to }
}

function FilterDateRangeField({
  label,
  startValue,
  endValue,
  onChangeStart,
  onChangeEnd,
}: {
  label: string
  startValue: string
  endValue: string
  onChangeStart: (value: string) => void
  onChangeEnd: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  const value: DateRange | undefined = useMemo(() => {
    const from = parseDateString(startValue)
    const to = parseDateString(endValue)
    if (!from) return undefined
    if (!to) return { from, to: undefined }
    if (from.getTime() > to.getTime()) {
      return { from: to, to: from }
    }
    return { from, to }
  }, [startValue, endValue])

  const handleChange = (range: DateRange | undefined) => {
    const normalized = normalizeRange(range)
    if (!normalized?.from) {
      onChangeStart('')
      onChangeEnd('')
      return
    }
    onChangeStart(toDateString(normalized.from))
    onChangeEnd(normalized.to ? toDateString(normalized.to) : '')
    if (normalized.from && normalized.to) {
      setOpen(false)
    }
  }

  const triggerLabel =
    value?.from &&
    (value.to
      ? `${format(value.from, dateConfig.formats.date, { locale: dateConfig.locale })} – ${format(value.to, dateConfig.formats.date, { locale: dateConfig.locale })}`
      : format(value.from, dateConfig.formats.date, {
          locale: dateConfig.locale,
        }))

  return (
    <div className={styles.filterBlock}>
      <span className={styles.filterLabel}>{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={`h-[42px] w-full justify-between text-left font-normal ${styles.dateRangeTrigger}`}
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {triggerLabel ?? 'dd/mm/aaaa – dd/mm/aaaa'}
            </span>
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="z-[100] w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={handleChange}
            locale={dateConfig.locale}
            numberOfMonths={2}
            defaultMonth={value?.from}
            className="rounded-lg border"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export type TicketsDashboardFilterModalProps = {
  isOpen: boolean
  onClose: () => void
  filters: FilterFormState
  onApply: (filters: FilterFormState) => void
}

export function TicketsDashboardFilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
}: TicketsDashboardFilterModalProps) {
  const [draftFilters, setDraftFilters] = useState<FilterFormState>(filters)

  useEffect(() => {
    if (isOpen) {
      setDraftFilters(filters)
    }
  }, [isOpen, filters])

  const { data: teamSearchOptions, isFetching: isTeamsLoading } = useQuery({
    queryKey: ['teams-list-dashboard-filter'],
    queryFn: async () => {
      const { data } = await getTeamsList()
      return data.map((team) => ({
        value: team.id,
        label: team.name,
      }))
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  })

  const clearDraftFilters = () => {
    setDraftFilters(emptyFilters())
  }

  const handleApply = () => {
    onApply(draftFilters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.filterModalOverlay}>
      <div className={styles.filterModal}>
        <div className={styles.filterModalHeader}>
          <div className={styles.filterModalTitle} />

          <button
            type="button"
            className={styles.filterModalClose}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.filterModalBody}>
          <div className={styles.filterGrid}>
            <SearchMultiSelect
              label="DEMANDANTE"
              value={draftFilters.demandante_id}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  demandante_id: value,
                }))
              }
              searchFn={searchOperations}
            />

            <SearchMultiSelect
              label="REQUISITANTE"
              value={draftFilters.requisitante}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  requisitante: value,
                }))
              }
              searchFn={searchRequesters}
            />

            <FilterDateRangeField
              label="DATA BASE"
              startValue={draftFilters.data_base_inicio}
              endValue={draftFilters.data_base_fim}
              onChangeStart={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  data_base_inicio: value,
                }))
              }
              onChangeEnd={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  data_base_fim: value,
                }))
              }
            />

            <FilterDateRangeField
              label="DATA DE ENTRADA"
              startValue={draftFilters.data_entrada_inicio}
              endValue={draftFilters.data_entrada_fim}
              onChangeStart={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  data_entrada_inicio: value,
                }))
              }
              onChangeEnd={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  data_entrada_fim: value,
                }))
              }
            />
          </div>

          <div className={styles.filterTogglesGrid}>
            <SearchMultiSelect
              label="PRIORIDADE"
              placeholder="Selecione"
              value={draftFilters.prioridade}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  prioridade: value,
                }))
              }
              staticOptions={prioritySearchOptions}
            />

            <SearchMultiSelect
              label="EQUIPE"
              placeholder="Selecione"
              value={draftFilters.equipe}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  equipe: value,
                }))
              }
              staticOptions={teamSearchOptions ?? []}
              optionsLoading={isTeamsLoading}
            />
          </div>
        </div>

        <div className={styles.filterModalFooter}>
          <Button
            type="button"
            className={styles.filterSecondaryButton}
            onClick={clearDraftFilters}
          >
            Limpar Filtro
          </Button>

          <Button
            type="button"
            className={styles.filterPrimaryButton}
            onClick={handleApply}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}
