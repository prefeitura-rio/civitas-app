'use client'

import { useQuery } from '@tanstack/react-query'
import { ChevronDown, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import filterModalStyles from '@/app/(app)/demandas/list/components/filter/tickets-general-list-filters.module.css'
import { Button } from '@/components/ui/button'
import { getTicketTypes } from '@/http/ticket-types/get-ticket.types'
import {
  type SearchOption,
  searchRequesters,
} from '@/http/tickets/tickets-dashboard-filters'

import {
  DEMAND_VOLUME_PRIORITY_OPTIONS,
  DEMAND_VOLUME_STATUS_OPTIONS,
  type DemandVolumeAdvancedFilterForm,
  type DemandVolumePressFilter,
  emptyDemandVolumeAdvancedFilters,
} from './demand-volume-filter-utils'

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
    queryKey: ['demand-volume-filter-search', label, debouncedSearch],
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
                  Nenhum resultado encontrado
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

function PressRelevanceField({
  value,
  onChange,
}: {
  value: DemandVolumePressFilter
  onChange: (value: DemandVolumePressFilter) => void
}) {
  const options: { value: DemandVolumePressFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'yes', label: 'Sim' },
    { value: 'no', label: 'Não' },
  ]

  return (
    <div className={filterModalStyles.filterBlock}>
      <span className={filterModalStyles.filterLabel}>
        RELEVANTE PARA IMPRENSA?
      </span>
      <div
        className={`${filterModalStyles.toggleGrid} ${filterModalStyles.toggleGridLastFull}`}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${filterModalStyles.toggleButton} ${
              value === option.value ? filterModalStyles.toggleButtonActive : ''
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export type DemandVolumeFilterModalProps = {
  isOpen: boolean
  onClose: () => void
  filters: DemandVolumeAdvancedFilterForm
  onApply: (filters: DemandVolumeAdvancedFilterForm) => void
}

export function DemandVolumeFilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
}: DemandVolumeFilterModalProps) {
  const [draftFilters, setDraftFilters] =
    useState<DemandVolumeAdvancedFilterForm>(filters)

  useEffect(() => {
    if (isOpen) {
      setDraftFilters(filters)
    }
  }, [isOpen, filters])

  const { data: ticketTypeOptions, isFetching: isTicketTypesLoading } =
    useQuery({
      queryKey: ['ticket-types', 'demand-volume-filter'],
      queryFn: async () => {
        const response = await getTicketTypes({ isActive: true })
        return (response.data ?? []).map((item) => ({
          value: item.id,
          label: item.name,
        }))
      },
      enabled: isOpen,
      staleTime: 1000 * 60 * 5,
    })

  const handleApply = () => {
    onApply(draftFilters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={filterModalStyles.filterModalOverlay}>
      <div className={filterModalStyles.filterModal}>
        <div className={filterModalStyles.filterModalHeader}>
          <div className={filterModalStyles.filterModalTitle} />
          <button
            type="button"
            className={filterModalStyles.filterModalClose}
            onClick={onClose}
            aria-label="Fechar filtros"
          >
            <X size={18} />
          </button>
        </div>

        <div className={filterModalStyles.filterModalBody}>
          <div className={filterModalStyles.filterGrid}>
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
              label="URGÊNCIA"
              placeholder="Selecione"
              value={draftFilters.prioridade}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  prioridade: value,
                }))
              }
              staticOptions={DEMAND_VOLUME_PRIORITY_OPTIONS}
            />

            <SearchMultiSelect
              label="STATUS DO CHAMADO"
              placeholder="Selecione"
              value={draftFilters.status}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  status: value,
                }))
              }
              staticOptions={DEMAND_VOLUME_STATUS_OPTIONS}
            />

            <SearchMultiSelect
              label="TIPO DE CHAMADO"
              placeholder="Selecione"
              value={draftFilters.tipo_chamado_id}
              onChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  tipo_chamado_id: value,
                }))
              }
              staticOptions={ticketTypeOptions ?? []}
              optionsLoading={isTicketTypesLoading}
            />
          </div>

          <div className={filterModalStyles.filterTogglesGrid}>
            <PressRelevanceField
              value={draftFilters.relevanteImprensa}
              onChange={(relevanteImprensa) =>
                setDraftFilters((current) => ({
                  ...current,
                  relevanteImprensa,
                }))
              }
            />
          </div>
        </div>

        <div className={filterModalStyles.filterModalFooter}>
          <Button
            type="button"
            className={filterModalStyles.filterSecondaryButton}
            onClick={() => setDraftFilters(emptyDemandVolumeAdvancedFilters())}
          >
            Limpar Filtro
          </Button>
          <Button
            type="button"
            className={filterModalStyles.filterPrimaryButton}
            onClick={handleApply}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}
