'use client'

import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Filter, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { FilterDateRangeField } from '@/app/(app)/demandas/components/filter-date-range-field'
import filterModalStyles from '@/app/(app)/demandas/list/components/filter/tickets-general-list-filters.module.css'
import { Button } from '@/components/ui/button'
import { getTeamsList } from '@/http/teams/get-teams'
import {
  searchOperations,
  type SearchOption,
  searchRequesters,
  searchTicketResponsibles,
} from '@/http/tickets/tickets-dashboard-filters'

import styles from './ticket-archive-filters.module.css'

export type TicketArchiveFilterState = {
  demandante_id: SearchOption[]
  requisitante: SearchOption[]
  responsavel_id: SearchOption[]
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
    requisitante: [],
    responsavel_id: [],
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
    <div className={filterModalStyles.filterBlock} ref={containerRef}>
      <span className={filterModalStyles.filterLabel}>{label}</span>

      <div className={filterModalStyles.multiSelectBox}>
        <div className={filterModalStyles.multiSelectInputWrapper}>
          <input
            value={search}
            onFocus={() => setIsOpen(true)}
            onChange={(event) => {
              setSearch(event.target.value)
              setIsOpen(true)
            }}
            placeholder={value.length > 0 ? '' : placeholder}
            className={filterModalStyles.multiSelectInput}
          />
          <ChevronDown
            className={filterModalStyles.multiSelectChevron}
            size={16}
          />

          {isOpen ? (
            <div className={filterModalStyles.multiSelectDropdown}>
              {optionsLoading ? (
                <div className={filterModalStyles.dropdownHint}>
                  Buscando...
                </div>
              ) : !staticOptions && debouncedSearch.trim().length < 2 ? (
                <div className={filterModalStyles.dropdownHint}>
                  {minCharsMessage}
                </div>
              ) : isFetching ? (
                <div className={filterModalStyles.dropdownHint}>
                  Buscando...
                </div>
              ) : options.length === 0 ? (
                <div className={filterModalStyles.dropdownHint}>
                  Nenhum resultado
                </div>
              ) : (
                options.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={filterModalStyles.dropdownOption}
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
          <div className={filterModalStyles.selectedChips}>
            {value.map((item) => (
              <span key={item.value} className={filterModalStyles.selectedChip}>
                {item.label}
                <button
                  type="button"
                  className={filterModalStyles.selectedChipRemove}
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
            className={filterModalStyles.filterModalClose}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.modalBody}>
          <div className={filterModalStyles.filterGrid}>
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
            <SearchMultiSelect
              label="RESPONSÁVEL"
              value={draftFilters.responsavel_id}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  responsavel_id: value,
                }))
              }
              searchFn={searchTicketResponsibles}
            />
            <SearchMultiSelect
              label="SERVIÇOS"
              value={draftFilters.servicos}
              onChange={(value) =>
                setDraftFilters((current) => ({ ...current, servicos: value }))
              }
              staticOptions={servicoOptions}
            />
          </div>

          <div className={filterModalStyles.filterTogglesGrid}>
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
            <div className={filterModalStyles.filterBlock}>
              <span className={filterModalStyles.filterLabel}>DATA BASE</span>
              <FilterDateRangeField
                popoverContentClassName="z-[140] w-auto p-0"
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
            </div>
            <div className={filterModalStyles.filterBlock}>
              <span className={filterModalStyles.filterLabel}>
                DATA DE ENTRADA
              </span>
              <FilterDateRangeField
                popoverContentClassName="z-[140] w-auto p-0"
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
          </div>
        </div>

        <footer className={styles.modalFooter}>
          <Button
            type="button"
            className={filterModalStyles.filterSecondaryButton}
            onClick={clearFilters}
          >
            Limpar filtro
          </Button>

          <Button
            type="button"
            className={filterModalStyles.filterPrimaryButton}
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
