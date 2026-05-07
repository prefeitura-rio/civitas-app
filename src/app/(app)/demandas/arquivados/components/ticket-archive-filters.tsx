'use client'

import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ChevronDown, Filter, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { getTeamsList } from '@/http/teams/get-teams'
import {
  searchOperations,
  type SearchOption,
} from '@/http/tickets/tickets-dashboard-filters'

import styles from './ticket-archive-filters.module.css'

export type TicketArchiveFilterState = {
  demandante_id: SearchOption[]
  data_base_inicio: string
  data_base_fim: string
  data_entrada_inicio: string
  data_entrada_fim: string
  prioridade: SearchOption[]
  equipe: SearchOption[]
  servicos: SearchOption[]
}

type SearchMultiSelectProps = {
  label: string
  value: SearchOption[]
  onChange: (value: SearchOption[]) => void
  placeholder?: string
  staticOptions?: SearchOption[]
  searchFn?: (search: string) => Promise<SearchOption[]>
  optionsLoading?: boolean
  minCharsMessage?: string
}

const prioridadeOptions = ['URGENTE', 'ALTA', 'ROTINA', 'SEM PRIORIDADE']

const servicoOptions: SearchOption[] = [
  { value: 'plate_search_services', label: 'Busca por placa' },
  { value: 'radar_search_services', label: 'Busca por radar' },
  { value: 'electronic_fence_services', label: 'Cerco eletrônico' },
  { value: 'image_search_services', label: 'Busca por imagem' },
  { value: 'correlated_plate_services', label: 'Placas correlatas' },
  { value: 'joint_plate_services', label: 'Placas conjuntas' },
  { value: 'image_reservation_services', label: 'Reserva de imagem' },
  { value: 'image_analysis_services', label: 'Análise de imagem' },
  { value: 'other_services', label: 'Outros' },
]

const prioridadeSearchOptions: SearchOption[] = prioridadeOptions.map(
  (value) => ({
    value,
    label: value
      .toLowerCase()
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
  }),
)

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

export function emptyArchiveFilters(): TicketArchiveFilterState {
  return {
    demandante_id: [],
    data_base_inicio: '',
    data_base_fim: '',
    data_entrada_inicio: '',
    data_entrada_fim: '',
    prioridade: [],
    equipe: [],
    servicos: [],
  }
}

function SearchMultiSelect({
  label,
  value,
  onChange,
  placeholder = 'Selecione',
  staticOptions,
  searchFn,
  optionsLoading,
  minCharsMessage = 'Digite ao menos 2 caracteres',
}: SearchMultiSelectProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const debouncedSearch = useDebouncedValue(search, 350)

  const { data, isFetching } = useQuery({
    queryKey: ['archive-filter-search', label, debouncedSearch],
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
  }, [selectedValues, staticOptions, debouncedSearch])

  const options = useMemo(() => {
    if (staticOptions) return staticFiltered
    return (data ?? []).filter((item) => !selectedValues.has(item.value))
  }, [selectedValues, staticFiltered, staticOptions, data])

  const addItem = (item: SearchOption) => {
    onChange([...value, item])
    setSearch('')
  }

  const removeItem = (itemValue: string) => {
    onChange(value.filter((item) => item.value !== itemValue))
  }

  return (
    <div className={styles.filterField} ref={containerRef}>
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
                <div className={styles.dropdownHint}>Nenhum resultado</div>
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

function DateRangeField({
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
  return (
    <div className={styles.filterField}>
      <span className={styles.filterLabel}>{label}</span>
      <div className={styles.dateRange}>
        <label className={styles.dateInputWrap}>
          <CalendarDays size={14} />
          <input
            type="date"
            value={startValue}
            onChange={(event) => onChangeStart(event.target.value)}
          />
        </label>

        <span className={styles.dateRangeSeparator}>até</span>

        <label className={styles.dateInputWrap}>
          <CalendarDays size={14} />
          <input
            type="date"
            value={endValue}
            onChange={(event) => onChangeEnd(event.target.value)}
          />
        </label>
      </div>
    </div>
  )
}

export type TicketArchiveFiltersModalProps = {
  isOpen: boolean
  onClose: () => void
  filters: TicketArchiveFilterState
  onApply: (filters: TicketArchiveFilterState) => void
}

export function TicketArchiveFiltersModal({
  isOpen,
  onClose,
  filters,
  onApply,
}: TicketArchiveFiltersModalProps) {
  const [draftFilters, setDraftFilters] =
    useState<TicketArchiveFilterState>(filters)

  const { data: teamSearchOptions, isFetching: isTeamsLoading } = useQuery({
    queryKey: ['teams-list-archive-filter'],
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

  useEffect(() => {
    if (isOpen) {
      setDraftFilters(filters)
    }
  }, [filters, isOpen])

  const clearFilters = () => {
    setDraftFilters(emptyArchiveFilters())
  }

  const applyFilters = () => {
    onApply(draftFilters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <header className={styles.modalHeader}>
          <div>
            <h2>Filtrar arquivo</h2>
            <p>Selecione os filtros para refinar os chamados arquivados.</p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.modalBody}>
          <div className={styles.grid}>
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
          </div>

          <div className={styles.grid}>
            <DateRangeField
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
            <DateRangeField
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

          <div className={styles.grid}>
            <SearchMultiSelect
              label="PRIORIDADE"
              value={draftFilters.prioridade}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  prioridade: value,
                }))
              }
              staticOptions={prioridadeSearchOptions}
            />
            <SearchMultiSelect
              label="EQUIPE"
              value={draftFilters.equipe}
              onChange={(value) =>
                setDraftFilters((current) => ({ ...current, equipe: value }))
              }
              staticOptions={teamSearchOptions ?? []}
              optionsLoading={isTeamsLoading}
            />
          </div>

          <SearchMultiSelect
            label="SERVIÇOS"
            value={draftFilters.servicos}
            onChange={(value) =>
              setDraftFilters((current) => ({ ...current, servicos: value }))
            }
            staticOptions={servicoOptions}
          />
        </div>

        <footer className={styles.modalFooter}>
          <Button
            type="button"
            className={styles.clearButton}
            onClick={clearFilters}
          >
            Limpar filtro
          </Button>

          <Button
            type="button"
            className={styles.saveButton}
            onClick={applyFilters}
          >
            <Filter size={16} />
            Aplicar
          </Button>
        </footer>
      </div>
    </div>
  )
}

export function ArchiveSearchField({
  search,
  onChange,
}: {
  search: string
  onChange: (value: string) => void
}) {
  return (
    <div className={styles.searchWrap}>
      <Search className={styles.searchIcon} size={18} />
      <input
        className={styles.searchInput}
        value={search}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar"
      />
    </div>
  )
}
