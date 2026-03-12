'use client'

import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Tag,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getTicketsDashboard,
  type TicketDashboardFilters,
} from '@/http/tickets/get-tickets-dashboard'
import {
  searchFocalPoints,
  searchInternalNumbers,
  searchOfficialLetters,
  searchOperations,
  type SearchOption,
  searchProcedureNumbers,
  searchRequesters,
  searchTicketNatures,
  searchTicketTypes,
} from '@/http/tickets/tickets-dashboard-filters'

import styles from './tickets-dashboard.module.css'

type DashboardServiceTag = {
  label: string
}

type DashboardItem = {
  id: string
  numero_interno: number
  chamado: string
  status: string
  demandante: string
  equipe?: string | null
  responsavel: string
  prioridade: string
  dias_atraso: number
  servicos: DashboardServiceTag[]
}

type DashboardSection = {
  total: number
  items: DashboardItem[]
}

type TicketDashboardResponse = {
  pendentes: DashboardSection
  restritos: DashboardSection
  aguardando_revisao: DashboardSection
  bloqueados: DashboardSection
  concluidos_total: number
  urgentes: DashboardSection
  em_atraso: DashboardSection
  total: number
  period_days: number
  overdue_after_days: number
}

type PeriodOption = {
  label: string
  value: number
}

type SectionKey =
  | 'pendentes'
  | 'restritos'
  | 'aguardando_revisao'
  | 'bloqueados'

type SectionConfig = {
  key: SectionKey
  label: string
}

type FilterFormState = {
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
  prioridade: string[]
  equipe: string[]
  servicos_realizados: string[]
}

const periodOptions: PeriodOption[] = [
  { label: 'Últimos 7 Dias', value: 7 },
  { label: 'Últimos 15 Dias', value: 15 },
  { label: 'Últimos 30 Dias', value: 30 },
  { label: 'Últimos 60 Dias', value: 60 },
  { label: 'Últimos 90 Dias', value: 90 },
]

const sections: SectionConfig[] = [
  { key: 'pendentes', label: 'PENDENTE' },
  { key: 'restritos', label: 'RESTRITO' },
  { key: 'aguardando_revisao', label: 'AGUARDANDO REVISÃO' },
  { key: 'bloqueados', label: 'BLOQUEADO' },
]

const statusOptions = [
  'PENDENTE',
  'BLOQUEADO',
  'AGUARDANDO REVISÃO',
  'ARQUIVADO',
]

const priorityOptions = ['URGENTE', 'ALTA', 'ROTINA', 'SEM PRIORIDADE']

const teamOptions = ['Fox', 'Hotel', 'Golf', 'India']

const serviceOptions = [
  'BUSCA POR RADAR',
  'BUSCA POR PLACA',
  'PLACAS CORRELATAS',
  'PLACAS CONJUNTAS',
  'BUSCA POR IMAGEM',
  'ANÁLISE DE IMAGEM',
  'RESERVA DE IMAGEM',
  'CERCO ELETRÔNICO',
  'OUTROS',
]

const emptyFilters = (): FilterFormState => ({
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
})

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

function normalizePriority(priority: string) {
  const value = priority.trim().toUpperCase()

  if (value === 'URGENTE') return 'Urgente'
  if (value === 'ALTA') return 'Alta'
  return 'Rotina'
}

function getPriorityBadgeValue(item: DashboardItem) {
  if (item.prioridade.trim().toUpperCase() === 'URGENTE') {
    return Math.max(item.dias_atraso, 1)
  }

  if (item.prioridade.trim().toUpperCase() === 'ALTA') {
    return Math.max(item.dias_atraso, 1)
  }

  return null
}

function getServiceClassName(label: string) {
  const normalized = label.trim().toLowerCase()

  if (normalized.includes('cerco')) return styles.serviceTagPink
  if (normalized.includes('busca por placa')) return styles.serviceTagGreen
  if (normalized.includes('reserva de imagem')) return styles.serviceTagYellow
  if (normalized.includes('busca por imagem')) return styles.serviceTagCyan
  if (normalized.includes('busca por radar')) return styles.serviceTagBlue
  if (normalized.includes('placas correlatas')) return styles.serviceTagOrange
  if (normalized.includes('placas conjuntas')) return styles.serviceTagPurple
  if (normalized.includes('outros')) return styles.serviceTagRed

  return styles.serviceTagDefault
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function ToggleButtonGroup({
  label,
  options,
  values,
  onChange,
}: {
  label: string
  options: string[]
  values: string[]
  onChange: (values: string[]) => void
}) {
  const toggleValue = (value: string) => {
    const exists = values.includes(value)

    if (exists) {
      onChange(values.filter((item) => item !== value))
      return
    }

    onChange([...values, value])
  }

  return (
    <div className={styles.filterBlock}>
      <span className={styles.filterLabel}>{label}</span>

      <div className={styles.toggleGrid}>
        {options.map((option) => {
          const selected = values.includes(option)

          return (
            <button
              key={option}
              type="button"
              className={`${styles.toggleButton} ${selected ? styles.toggleButtonActive : ''}`}
              onClick={() => toggleValue(option)}
            >
              {formatLabel(option)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SearchMultiSelect({
  label,
  placeholder = 'Selecione',
  value,
  onChange,
  searchFn,
  minCharsMessage = 'Digite ao menos 2 caracteres',
}: {
  label: string
  placeholder?: string
  value: SearchOption[]
  onChange: (value: SearchOption[]) => void
  searchFn: (search: string) => Promise<SearchOption[]>
  minCharsMessage?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 350)

  const { data, isFetching } = useQuery({
    queryKey: ['dashboard-filter-search', label, debouncedSearch],
    queryFn: () => searchFn(debouncedSearch),
    enabled: isOpen && debouncedSearch.trim().length >= 2,
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

  const options = useMemo(() => {
    return (data ?? []).filter((item) => !selectedValues.has(item.value))
  }, [data, selectedValues])

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

        {isOpen ? (
          <div className={styles.multiSelectDropdown}>
            {debouncedSearch.trim().length < 2 ? (
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
                  <span>{item.label}</span>
                  <Check size={14} />
                </button>
              ))
            )}
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
    <div className={styles.filterBlock}>
      <span className={styles.filterLabel}>{label}</span>

      <div className={styles.dateRange}>
        <input
          type="date"
          value={startValue}
          onChange={(event) => onChangeStart(event.target.value)}
          className={styles.dateInput}
        />

        <input
          type="date"
          value={endValue}
          onChange={(event) => onChangeEnd(event.target.value)}
          className={styles.dateInput}
        />
      </div>
    </div>
  )
}

function DashboardSectionTable({
  title,
  total,
  items,
  isOpen,
  onToggle,
  showWarningIcon = false,
}: {
  title: string
  total: number
  items: DashboardItem[]
  isOpen: boolean
  onToggle: () => void
  showWarningIcon?: boolean
}) {
  return (
    <section className={styles.sectionCard}>
      <button type="button" className={styles.sectionHeader} onClick={onToggle}>
        <div className={styles.sectionHeaderLeft}>
          <span className={styles.sectionBadge}>{title}</span>
          <span className={styles.sectionCount}>{total}</span>
        </div>

        <span className={styles.sectionChevron}>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {isOpen ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>CHAMADO</th>
                <th>DEMANDANTE</th>
                <th>EQUIPE</th>
                <th>RESPONSÁVEL</th>
                <th>SERVIÇOS</th>
                <th className={styles.priorityHeader}>PRIORIDADE</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => {
                const previewLabels = item.servicos.slice(0, 2)
                const extraCount = Math.max(
                  item.servicos.length - previewLabels.length,
                  0,
                )
                const badgeValue = getPriorityBadgeValue(item)

                return (
                  <tr key={item.id}>
                    <td>{item.chamado}</td>
                    <td>{item.demandante}</td>
                    <td>{item.equipe || '-'}</td>
                    <td>
                      <div className={styles.responsavelCell}>
                        {showWarningIcon ? (
                          <AlertTriangle
                            className={styles.warningIcon}
                            size={14}
                          />
                        ) : null}
                        <span>{item.responsavel}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.servicesCell}>
                        {previewLabels.map((service, index) => (
                          <span
                            key={`${item.id}-${service.label}-${index}`}
                            className={`${styles.serviceTag} ${getServiceClassName(service.label)}`}
                          >
                            <Tag
                              className={styles.serviceTagIcon}
                              strokeWidth={2}
                            />
                            <span>{service.label}</span>
                          </span>
                        ))}

                        {extraCount > 0 ? (
                          <div className={styles.extraTagWrapper}>
                            <span className={styles.extraTag}>
                              +{extraCount}
                            </span>

                            <div className={styles.extraTooltip}>
                              <div className={styles.extraTooltipContent}>
                                {item.servicos
                                  .slice(2)
                                  .map((service, index) => (
                                    <span
                                      key={`${item.id}-extra-${service.label}-${index}`}
                                      className={`${styles.serviceTag} ${getServiceClassName(service.label)}`}
                                    >
                                      <Tag
                                        className={styles.serviceTagIcon}
                                        strokeWidth={2}
                                      />
                                      {service.label}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className={styles.priorityCell}>
                        <span>{normalizePriority(item.prioridade)}</span>

                        {badgeValue ? (
                          <span
                            className={
                              normalizePriority(item.prioridade) === 'Urgente'
                                ? styles.priorityDangerBadge
                                : styles.priorityWarningBadge
                            }
                          >
                            {badgeValue}
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}

export function TicketsDashboard() {
  const [periodDays, setPeriodDays] = useState<number>(30)
  const [search, setSearch] = useState<string>('')

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] =
    useState<FilterFormState>(emptyFilters())
  const [appliedFilters, setAppliedFilters] =
    useState<FilterFormState>(emptyFilters())

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    {
      pendentes: true,
      restritos: true,
      aguardando_revisao: true,
      bloqueados: true,
    },
  )

  const dashboardPayload = useMemo<TicketDashboardFilters>(() => {
    return {
      period_days: periodDays,
      overdue_after_days: 7,
      search: search.trim() || undefined,

      tipo_chamado_id: appliedFilters.tipo_chamado_id.map((item) => item.value),
      numero_interno: appliedFilters.numero_interno.map((item) =>
        Number(item.value),
      ),
      numero_procedimento: appliedFilters.numero_procedimento.map(
        (item) => item.value,
      ),
      numero_oficio: appliedFilters.numero_oficio.map((item) => item.value),
      natureza_id: appliedFilters.natureza_id.map((item) => item.value),
      demandante_id: appliedFilters.demandante_id.map((item) => item.value),
      requisitante: appliedFilters.requisitante.map((item) => item.value),
      ponto_focal: appliedFilters.ponto_focal.map((item) => item.value),

      data_base_inicio: appliedFilters.data_base_inicio || undefined,
      data_base_fim: appliedFilters.data_base_fim || undefined,
      data_entrada_inicio: appliedFilters.data_entrada_inicio || undefined,
      data_entrada_fim: appliedFilters.data_entrada_fim || undefined,

      status: appliedFilters.status.length ? appliedFilters.status : undefined,
      prioridade: appliedFilters.prioridade.length
        ? appliedFilters.prioridade
        : undefined,
      equipe: appliedFilters.equipe.length ? appliedFilters.equipe : undefined,
      servicos_realizados: appliedFilters.servicos_realizados.length
        ? appliedFilters.servicos_realizados
        : undefined,
    }
  }, [appliedFilters, periodDays, search])

  const { data, isLoading, isFetching } = useQuery<TicketDashboardResponse>({
    queryKey: ['tickets-dashboard', dashboardPayload],
    queryFn: () => getTicketsDashboard(dashboardPayload),
    staleTime: 1000 * 60,
  })

  const cards = useMemo(() => {
    return [
      { value: data?.concluidos_total ?? 0, label: 'Concluídos' },
      { value: data?.urgentes.total ?? 0, label: 'Urgentes' },
      { value: data?.em_atraso.total ?? 0, label: 'Em atraso' },
      { value: data?.bloqueados.total ?? 0, label: 'Bloqueados' },
    ]
  }, [data])

  const activeFiltersCount = useMemo(() => {
    return [
      appliedFilters.tipo_chamado_id.length,
      appliedFilters.numero_interno.length,
      appliedFilters.numero_procedimento.length,
      appliedFilters.numero_oficio.length,
      appliedFilters.natureza_id.length,
      appliedFilters.demandante_id.length,
      appliedFilters.requisitante.length,
      appliedFilters.ponto_focal.length,
      appliedFilters.status.length,
      appliedFilters.prioridade.length,
      appliedFilters.equipe.length,
      appliedFilters.servicos_realizados.length,
      appliedFilters.data_base_inicio ? 1 : 0,
      appliedFilters.data_base_fim ? 1 : 0,
      appliedFilters.data_entrada_inicio ? 1 : 0,
      appliedFilters.data_entrada_fim ? 1 : 0,
    ].reduce((acc, value) => acc + value, 0)
  }, [appliedFilters])

  const toggleSection = (key: SectionKey) => {
    setOpenSections((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  const openFilterModal = () => {
    setDraftFilters(appliedFilters)
    setIsFilterModalOpen(true)
  }

  const clearDraftFilters = () => {
    setDraftFilters(emptyFilters())
  }

  const applyDraftFilters = () => {
    setAppliedFilters(draftFilters)
    setIsFilterModalOpen(false)
  }

  return (
    <div className={styles.dashboardContainer}>
      <section className={styles.summaryPanel}>
        <div className={styles.summaryTop}>
          <div />
          <div className={styles.selectWrapper}>
            <select
              className={styles.periodSelect}
              value={periodDays}
              onChange={(event) => setPeriodDays(Number(event.target.value))}
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.selectIcon} size={16} />
          </div>
        </div>

        <div className={styles.summaryCards}>
          {cards.map((card) => (
            <div key={card.label} className={styles.summaryCard}>
              <strong className={styles.summaryValue}>{card.value}</strong>
              <span className={styles.summaryLabel}>{card.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar"
            className={styles.searchInput}
          />
        </div>

        <div className={styles.toolbarActions}>
          <Button type="button" className={styles.toolbarButton}>
            Exportar
          </Button>

          <Button
            type="button"
            className={styles.toolbarButton}
            onClick={openFilterModal}
          >
            Filtrar {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
          </Button>
        </div>
      </section>

      <div className={styles.sectionsWrapper}>
        {isLoading ? (
          <div className={styles.emptyState}>Carregando dashboard...</div>
        ) : null}

        {!isLoading && data ? (
          <>
            {sections.map((section) => (
              <DashboardSectionTable
                key={section.key}
                title={section.label}
                total={data[section.key].total}
                items={data[section.key].items}
                isOpen={openSections[section.key]}
                onToggle={() => toggleSection(section.key)}
                showWarningIcon={section.key === 'bloqueados'}
              />
            ))}
          </>
        ) : null}

        {!isLoading && !data ? (
          <div className={styles.emptyState}>
            Não foi possível carregar os dados do dashboard.
          </div>
        ) : null}
      </div>

      {isFetching && !isLoading ? (
        <div className={styles.fetchingState}>Atualizando dados...</div>
      ) : null}

      {isFilterModalOpen ? (
        <div className={styles.filterModalOverlay}>
          <div className={styles.filterModal}>
            <div className={styles.filterModalHeader}>
              <div className={styles.filterModalTitle}></div>

              <button
                type="button"
                className={styles.filterModalClose}
                onClick={() => setIsFilterModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.filterModalBody}>
              <div className={styles.filterGrid}>
                <SearchMultiSelect
                  label="TIPO DE CHAMADO"
                  value={draftFilters.tipo_chamado_id}
                  onChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      tipo_chamado_id: value,
                    }))
                  }
                  searchFn={searchTicketTypes}
                />

                <SearchMultiSelect
                  label="Nº INTERNO"
                  value={draftFilters.numero_interno}
                  onChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      numero_interno: value,
                    }))
                  }
                  searchFn={searchInternalNumbers}
                />

                <SearchMultiSelect
                  label="Nº DE PROCEDIMENTO"
                  value={draftFilters.numero_procedimento}
                  onChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      numero_procedimento: value,
                    }))
                  }
                  searchFn={searchProcedureNumbers}
                />

                <SearchMultiSelect
                  label="Nº DE OFÍCIO"
                  value={draftFilters.numero_oficio}
                  onChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      numero_oficio: value,
                    }))
                  }
                  searchFn={searchOfficialLetters}
                />

                <SearchMultiSelect
                  label="NATUREZA DO CHAMADO"
                  value={draftFilters.natureza_id}
                  onChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      natureza_id: value,
                    }))
                  }
                  searchFn={searchTicketNatures}
                />

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
                  label="PONTO FOCAL"
                  value={draftFilters.ponto_focal}
                  onChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      ponto_focal: value,
                    }))
                  }
                  searchFn={searchFocalPoints}
                />

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

              <div className={styles.filterTogglesGrid}>
                <ToggleButtonGroup
                  label="STATUS DO CHAMADO"
                  options={statusOptions}
                  values={draftFilters.status}
                  onChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      status: value,
                    }))
                  }
                />

                <ToggleButtonGroup
                  label="PRIORIDADE"
                  options={priorityOptions}
                  values={draftFilters.prioridade}
                  onChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      prioridade: value,
                    }))
                  }
                />

                <ToggleButtonGroup
                  label="EQUIPE"
                  options={teamOptions}
                  values={draftFilters.equipe}
                  onChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      equipe: value,
                    }))
                  }
                />

                <ToggleButtonGroup
                  label="SERVIÇOS REALIZADOS"
                  options={serviceOptions}
                  values={draftFilters.servicos_realizados}
                  onChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      servicos_realizados: value,
                    }))
                  }
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
                onClick={applyDraftFilters}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
