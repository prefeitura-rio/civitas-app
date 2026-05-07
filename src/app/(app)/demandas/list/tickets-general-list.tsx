'use client'

import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Search,
  Tag,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getTicketsDashboard,
  type TicketDashboardFilters,
} from '@/http/tickets/get-tickets-dashboard'

import {
  emptyFilters,
  type FilterFormState,
  TicketsDashboardFilterModal,
} from './components/filter/tickets-general-list-filters'
import styles from './tickets-general-list.module.css'

type DashboardServiceTag = {
  label: string
}

const LEVANTAMENTO_PREVIO_TIPO_NOME = 'Levantamento Prévio'

type DashboardItem = {
  id: string
  numero_interno: number
  chamado: string
  data_criacao?: string | null
  status: string
  demandante: string
  equipe?: string | null
  responsavel: string
  prioridade: string
  dias_atraso: number
  servicos: DashboardServiceTag[]
  tipo_chamado_nome?: string | null
}

type DashboardSection = {
  total: number
  items: DashboardItem[]
}

type TicketDashboardResponse = {
  pendentes: DashboardSection | null
  restritos: DashboardSection | null
  aguardando_revisao_adjunto: DashboardSection | null
  aguardando_revisao_administrativo: DashboardSection | null
  bloqueados: DashboardSection | null
  concluidos_total: number
  urgentes: DashboardSection | null
  em_atraso: DashboardSection | null
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
  | 'aguardando_revisao_adjunto'
  | 'aguardando_revisao_administrativo'
  | 'bloqueados'

type SectionConfig = {
  key: SectionKey
  label: string
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
  { key: 'aguardando_revisao_adjunto', label: 'AGUARDANDO REVISÃO ADJUNTO' },
  {
    key: 'aguardando_revisao_administrativo',
    label: 'AGUARDANDO REVISÃO ADMINISTRATIVO',
  },
  { key: 'bloqueados', label: 'BLOQUEADO' },
]

function normalizePriority(priority: string) {
  const value = priority?.trim().toUpperCase()
  if (value === null) return ''

  if (value === 'URGENTE') return 'Urgente'
  if (value === 'ALTA') return 'Alta'
  if (value === 'ROTINA') return 'Rotina'
}

function getPriorityBadgeValue(item: DashboardItem) {
  return item.dias_atraso > 0 ? item.dias_atraso : null
}

/** Cores do count ao lado da prioridade: 1–15 verde, 16–24 amarelo, ≥25 vermelho */
function getPriorityCountBadgeClass(count: number) {
  if (count <= 15) return styles.prioritySuccessBadge
  if (count <= 24) return styles.priorityWarningBadge
  return styles.priorityDangerBadge
}

function isLevantamentoPrevioTipo(item: DashboardItem) {
  return item.tipo_chamado_nome?.trim() === LEVANTAMENTO_PREVIO_TIPO_NOME
}

function getServiceClassName(label: string) {
  const normalized = label.trim().toLowerCase()

  if (normalized.includes('cerco')) return styles.serviceTagPink
  if (
    normalized.includes('busca por placa') ||
    normalized.includes('busca de placa')
  )
    return styles.serviceTagGreen
  if (normalized.includes('reserva de imagem')) return styles.serviceTagYellow
  if (
    normalized.includes('busca por imagem') ||
    normalized.includes('busca de imagem')
  )
    return styles.serviceTagCyan
  if (
    normalized.includes('busca por radar') ||
    normalized.includes('busca de radar')
  )
    return styles.serviceTagBlue
  if (normalized.includes('placas correlatas')) return styles.serviceTagOrange
  if (normalized.includes('placas conjuntas')) return styles.serviceTagPurple
  if (normalized.includes('outros')) return styles.serviceTagRed

  return styles.serviceTagDefault
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
                <th>DATA CRIAÇÃO</th>
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
                    <td>
                      <Link
                        href={`/demandas/${encodeURIComponent(item.id)}`}
                        className={styles.chamadoLink}
                      >
                        {item.chamado}
                      </Link>
                    </td>
                    <td>
                      {item.data_criacao?.trim() ? item.data_criacao : '—'}
                    </td>
                    <td>{item.demandante}</td>
                    <td>{item.equipe || '-'}</td>
                    <td>
                      <div className={styles.responsavelCell}>
                        {showWarningIcon ? (
                          <AlertTriangle
                            className={styles.warningIcon}
                            size={14}
                            aria-hidden
                          />
                        ) : isLevantamentoPrevioTipo(item) ? (
                          <Tooltip asChild text={LEVANTAMENTO_PREVIO_TIPO_NOME}>
                            <span
                              className={
                                styles.levantamentoPrevioTooltipTrigger
                              }
                            >
                              <ClipboardList
                                className={styles.levantamentoPrevioIcon}
                                size={14}
                                aria-hidden
                              />
                            </span>
                          </Tooltip>
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
                        {badgeValue ? (
                          <span
                            className={getPriorityCountBadgeClass(badgeValue)}
                          >
                            {badgeValue}
                          </span>
                        ) : null}
                        <span className={styles.priorityLabel}>
                          {normalizePriority(item.prioridade)}
                        </span>
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

export function TicketsGeneralList() {
  const [periodDays, setPeriodDays] = useState<number>(30)
  const [search, setSearch] = useState<string>('')
  const debouncedSearch = useDebounce(search, 350)

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] =
    useState<FilterFormState>(emptyFilters())

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    {
      pendentes: true,
      restritos: true,
      aguardando_revisao_adjunto: true,
      aguardando_revisao_administrativo: true,
      bloqueados: true,
    },
  )

  const dashboardPayload = useMemo<TicketDashboardFilters>(() => {
    return {
      period_days: periodDays,
      overdue_after_days: 7,
      search: debouncedSearch.trim() || undefined,

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
      ponto_focal: appliedFilters.ponto_focal.map((item) => item.value),

      data_base_inicio: appliedFilters.data_base_inicio || undefined,
      data_base_fim: appliedFilters.data_base_fim || undefined,
      data_entrada_inicio: appliedFilters.data_entrada_inicio || undefined,
      data_entrada_fim: appliedFilters.data_entrada_fim || undefined,

      status: appliedFilters.status.length ? appliedFilters.status : undefined,
      prioridade: appliedFilters.prioridade.length
        ? appliedFilters.prioridade.map((item) => item.value)
        : undefined,
      equipe: appliedFilters.equipe.length
        ? appliedFilters.equipe.map((item) => item.value)
        : undefined,
      servicos: appliedFilters.servicos.length
        ? appliedFilters.servicos.map((item) => item.value)
        : undefined,
    }
  }, [appliedFilters, periodDays, debouncedSearch])

  const { data, isLoading, isFetching } = useQuery<TicketDashboardResponse>({
    queryKey: ['tickets-dashboard', dashboardPayload],
    queryFn: () => getTicketsDashboard(dashboardPayload),
    staleTime: 1000 * 60,
  })

  const cards = useMemo(() => {
    const list: { value: number; label: string }[] = [
      { value: data?.concluidos_total ?? 0, label: 'Concluídos' },
    ]
    if (data?.urgentes != null) {
      list.push({ value: data.urgentes.total, label: 'Urgentes' })
    }
    if (data?.em_atraso != null) {
      list.push({ value: data.em_atraso.total, label: 'Em atraso' })
    }
    if (data?.bloqueados != null) {
      list.push({ value: data.bloqueados.total, label: 'Bloqueados' })
    }
    return list
  }, [data])

  const activeFiltersCount = useMemo(() => {
    return [
      appliedFilters.tipo_chamado_id.length,
      appliedFilters.numero_interno.length,
      appliedFilters.numero_procedimento.length,
      appliedFilters.numero_oficio.length,
      appliedFilters.natureza_id.length,
      appliedFilters.demandante_id.length,
      appliedFilters.ponto_focal.length,
      appliedFilters.status.length,
      appliedFilters.prioridade.length,
      appliedFilters.equipe.length,
      appliedFilters.servicos.length,
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
    setIsFilterModalOpen(true)
  }

  const clearAppliedFilters = () => {
    setAppliedFilters(emptyFilters())
  }

  return (
    <div className={styles.dashboardContainer}>
      <section className={styles.summaryPanel}>
        <div className={styles.summaryTop}>
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
          {activeFiltersCount > 0 ? (
            <button
              type="button"
              className={styles.toolbarClearFilters}
              onClick={clearAppliedFilters}
            >
              Limpar filtro
            </button>
          ) : null}
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
            {sections
              .filter((section) => data[section.key] != null)
              .map((section) => {
                const block = data[section.key]!
                return (
                  <DashboardSectionTable
                    key={section.key}
                    title={section.label}
                    total={block.total}
                    items={block.items}
                    isOpen={openSections[section.key]}
                    onToggle={() => toggleSection(section.key)}
                    showWarningIcon={section.key === 'bloqueados'}
                  />
                )
              })}
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

      <TicketsDashboardFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={appliedFilters}
        onApply={setAppliedFilters}
      />
    </div>
  )
}
