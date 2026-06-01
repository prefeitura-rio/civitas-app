'use client'

import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  Search,
  Tag,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getTicketsDashboard,
  type TicketDashboardFilters,
} from '@/http/tickets/get-tickets-dashboard'
import { getApiErrorMessage } from '@/utils/error-handlers'

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

const SEARCH_TOOLTIP_TEXT =
  'Buscar por nº interno, requisitante, demandante, ofício, procedimento, ponto focal, equipe, responsável, comentários, relatório da demanda, placa, orientações ou observações'

type DashboardItem = {
  id: string
  internal_number: number
  ticket: string
  created_at?: string | null
  status: string
  requester_operation: string
  team?: string | null
  assignee: string
  priority: string
  overdue_days: number
  services: DashboardServiceTag[]
  ticket_type_name?: string | null
}

type DashboardSection = {
  total: number
  items: DashboardItem[]
}

type TicketDashboardResponse = {
  pending: DashboardSection | null
  restricted: DashboardSection | null
  awaiting_adjunct_review: DashboardSection | null
  awaiting_administrative_review: DashboardSection | null
  blocked: DashboardSection | null
  urgent: DashboardSection | null
  overdue: DashboardSection | null
  total: number
  period_days: number
  overdue_after_days: number
}

type PeriodOption = {
  label: string
  value: number
}

type SectionKey =
  | 'pending'
  | 'restricted'
  | 'awaiting_adjunct_review'
  | 'awaiting_administrative_review'
  | 'blocked'

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
  { key: 'pending', label: 'PENDENTE' },
  { key: 'restricted', label: 'RESTRITO' },
  { key: 'awaiting_adjunct_review', label: 'AGUARDANDO REVISÃO ADJUNTO' },
  {
    key: 'awaiting_administrative_review',
    label: 'AGUARDANDO REVISÃO ADMINISTRATIVO',
  },
  { key: 'blocked', label: 'BLOQUEADO' },
]

function escapeCsvCell(value: string): string {
  const needsQuotes = /[",\n\r]/.test(value)
  const escaped = value.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function triggerCsvDownload(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  anchor.click()
  URL.revokeObjectURL(url)
}

function formatDashboardDataCriacao(item: DashboardItem): string {
  const raw = item.created_at?.trim()
  return raw && raw.length > 0 ? raw : '—'
}

function formatDashboardServicos(item: DashboardItem): string {
  return item.services.map((s) => s.label).join('; ')
}

function formatDashboardPriorityCell(item: DashboardItem): string {
  return normalizePriority(item.priority) ?? item.priority?.trim() ?? ''
}

function collectDashboardExportRows(
  payload: TicketDashboardResponse,
): DashboardItem[] {
  const rows: DashboardItem[] = []
  for (const section of sections) {
    const block = payload[section.key]
    if (block?.items?.length) rows.push(...block.items)
  }
  return rows
}

function buildDashboardCsv(rows: DashboardItem[]): string {
  const header = [
    'CHAMADO',
    'DATA CRIAÇÃO',
    'DEMANDANTE',
    'EQUIPE',
    'RESPONSÁVEL',
    'SERVIÇOS',
    'PRIORIDADE',
  ]
    .map(escapeCsvCell)
    .join(',')

  const body = rows
    .map((item) =>
      [
        item.ticket,
        formatDashboardDataCriacao(item),
        item.requester_operation,
        item.team?.trim() || '-',
        item.assignee,
        formatDashboardServicos(item),
        formatDashboardPriorityCell(item),
      ]
        .map(escapeCsvCell)
        .join(','),
    )
    .join('\r\n')

  return `\uFEFF${header}\r\n${body}`
}

function normalizePriority(priority: string) {
  const value = priority?.trim().toUpperCase()
  if (value === null) return ''

  if (value === 'URGENTE') return 'Urgente'
  if (value === 'ALTA') return 'Alta'
  if (value === 'ROTINA') return 'Rotina'
}

function getPriorityBadgeValue(item: DashboardItem) {
  return item.overdue_days > 0 ? item.overdue_days : null
}

/** Cores do count ao lado da priority: 1–15 verde, 16–24 amarelo, ≥25 vermelho */
function getPriorityCountBadgeClass(count: number) {
  if (count <= 15) return styles.prioritySuccessBadge
  if (count <= 24) return styles.priorityWarningBadge
  return styles.priorityDangerBadge
}

function isLevantamentoPrevioTipo(item: DashboardItem) {
  return item.ticket_type_name?.trim() === LEVANTAMENTO_PREVIO_TIPO_NOME
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
  if (normalized.includes('other')) return styles.serviceTagRed
  if (normalized.includes('atlas')) return styles.serviceTagDefault

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
                const previewLabels = item.services.slice(0, 2)
                const extraCount = Math.max(
                  item.services.length - previewLabels.length,
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
                        {item.ticket}
                      </Link>
                    </td>
                    <td>{item.created_at?.trim() ? item.created_at : '—'}</td>
                    <td>{item.requester_operation}</td>
                    <td>{item.team || '-'}</td>
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
                        <span>{item.assignee}</span>
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
                                {item.services
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
                          {normalizePriority(item.priority)}
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

  const [isExporting, setIsExporting] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] =
    useState<FilterFormState>(emptyFilters())

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    {
      pending: true,
      restricted: true,
      awaiting_adjunct_review: true,
      awaiting_administrative_review: true,
      blocked: true,
    },
  )

  const dashboardPayload = useMemo<TicketDashboardFilters>(() => {
    return {
      period_days: periodDays,
      overdue_after_days: 7,
      search: debouncedSearch.trim() || undefined,

      ticket_type_id: appliedFilters.ticket_type_id.map((item) => item.value),
      internal_number: appliedFilters.internal_number.map((item) =>
        Number(item.value),
      ),
      procedure_number: appliedFilters.procedure_number.map(
        (item) => item.value,
      ),
      official_letter_number: appliedFilters.official_letter_number.map(
        (item) => item.value,
      ),
      nature_id: appliedFilters.nature_id.map((item) => item.value),
      operation_id: appliedFilters.operation_id.map((item) => item.value),
      requester: appliedFilters.requester.length
        ? appliedFilters.requester.map((item) => item.value)
        : undefined,
      assignee_id: appliedFilters.assignee_id.length
        ? appliedFilters.assignee_id.map((item) => item.value)
        : undefined,
      focal_point: appliedFilters.focal_point.map((item) => item.value),

      base_date_start: appliedFilters.base_date_start || undefined,
      base_date_end: appliedFilters.base_date_end || undefined,
      entry_date_start: appliedFilters.entry_date_start || undefined,
      entry_date_end: appliedFilters.entry_date_end || undefined,

      status: appliedFilters.status.length ? appliedFilters.status : undefined,
      priority: appliedFilters.priority.length
        ? appliedFilters.priority.map((item) => item.value)
        : undefined,
      team: appliedFilters.team.length
        ? appliedFilters.team.map((item) => item.value)
        : undefined,
      services: appliedFilters.services.length
        ? appliedFilters.services.map((item) => item.value)
        : undefined,
    }
  }, [appliedFilters, periodDays, debouncedSearch])

  const { data, isLoading, isFetching } = useQuery<TicketDashboardResponse>({
    queryKey: ['tickets-dashboard', dashboardPayload],
    queryFn: () => getTicketsDashboard(dashboardPayload),
    staleTime: 1000 * 60,
    refetchOnMount: 'always',
  })

  const cards = useMemo(() => {
    const list: { value: number; label: string }[] = []
    if (data?.urgent != null) {
      list.push({ value: data.urgent.total, label: 'Urgentes' })
    }
    if (data?.overdue != null) {
      list.push({ value: data.overdue.total, label: 'Em atraso' })
    }
    if (data?.blocked != null) {
      list.push({ value: data.blocked.total, label: 'Bloqueados' })
    }
    return list
  }, [data])

  const activeFiltersCount = useMemo(() => {
    return [
      appliedFilters.ticket_type_id.length,
      appliedFilters.internal_number.length,
      appliedFilters.procedure_number.length,
      appliedFilters.official_letter_number.length,
      appliedFilters.nature_id.length,
      appliedFilters.operation_id.length,
      appliedFilters.requester.length,
      appliedFilters.assignee_id.length,
      appliedFilters.focal_point.length,
      appliedFilters.status.length,
      appliedFilters.priority.length,
      appliedFilters.team.length,
      appliedFilters.services.length,
      appliedFilters.base_date_start ? 1 : 0,
      appliedFilters.base_date_end ? 1 : 0,
      appliedFilters.entry_date_start ? 1 : 0,
      appliedFilters.entry_date_end ? 1 : 0,
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

  const handleExportCsv = useCallback(async () => {
    setIsExporting(true)
    try {
      const fresh = (await getTicketsDashboard(
        dashboardPayload,
      )) as TicketDashboardResponse
      const rows = collectDashboardExportRows(fresh)
      if (rows.length === 0) {
        toast.message('Nenhum chamado para exportar com os filtros atuais.')
        return
      }
      const csv = buildDashboardCsv(rows)
      const dateStamp = new Date().toISOString().slice(0, 10)
      triggerCsvDownload(csv, `dashboard-demandas-${dateStamp}.csv`)
      toast.success(`Exportação concluída (${rows.length} linhas).`)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsExporting(false)
    }
  }, [dashboardPayload])

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
          <div className={styles.searchTooltip} role="tooltip">
            <div className={styles.searchTooltipContent}>
              <p>{SEARCH_TOOLTIP_TEXT}</p>
            </div>
          </div>
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
          <Button
            type="button"
            className={styles.toolbarButton}
            disabled={isExporting || isLoading}
            onClick={() => {
              handleExportCsv()
            }}
          >
            <Download size={16} />
            {isExporting ? 'Exportando…' : 'Exportar'}
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
                    showWarningIcon={section.key === 'blocked'}
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
