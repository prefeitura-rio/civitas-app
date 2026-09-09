'use client'

import { useQuery } from '@tanstack/react-query'
import { Download, FileText, Filter, Tag } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import {
  getTicketArchive,
  type TicketArchiveFilters,
  type TicketArchiveListItem,
} from '@/http/tickets/get-ticket-archive'
import { getApiErrorMessage } from '@/utils/error-handlers'

import { getServiceTagClass } from '../../utils/service-tag-class'
import {
  ArchiveSearchField,
  emptyArchiveFilters,
  TicketArchiveFiltersModal,
  type TicketArchiveFilterState,
} from './ticket-archive-filters'
import styles from './ticket-archive-list.module.css'

function parseServices(rawServices: unknown): string[] {
  if (!Array.isArray(rawServices)) return []
  return rawServices
    .map((service) => {
      if (typeof service === 'string') return service
      if (service && typeof service === 'object') {
        const fromLabel = (service as { label?: unknown }).label
        if (typeof fromLabel === 'string') return fromLabel
        const fromNome = (service as { nome?: unknown }).nome
        if (typeof fromNome === 'string') return fromNome
      }
      return ''
    })
    .filter(Boolean)
}

function parseArchiveTeams(
  rawTeams: unknown,
  fallbackTeam: string,
): NonNullable<TicketArchiveListItem['teams']> {
  if (!Array.isArray(rawTeams)) {
    return fallbackTeam && fallbackTeam !== '-'
      ? [{ name: fallbackTeam, people: [] }]
      : []
  }

  return rawTeams
    .map((team) => {
      if (!team || typeof team !== 'object') return null

      const row = team as { name?: unknown; people?: unknown }
      const name = typeof row.name === 'string' ? row.name.trim() : ''
      const people = Array.isArray(row.people)
        ? row.people
            .map((person) => (typeof person === 'string' ? person.trim() : ''))
            .filter(Boolean)
        : []

      return name ? { name, people } : null
    })
    .filter((team): team is { name: string; people: string[] } => Boolean(team))
}

function pickOptionalDate(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

function formatArchiveDate(value?: string | null) {
  const raw = value?.trim()
  return raw && raw.length > 0 ? raw : '—'
}

const SEI_PREENCHIDO_TOOLTIP = 'Processo SEI preenchido.'

function parseSeiPreenchido(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1'
  }
  return false
}

function normalizeArchiveItem(item: unknown): TicketArchiveListItem {
  const row = (item as Record<string, unknown>) ?? {}

  const id = String(row.id ?? row.ticket_id ?? '')
  const chamado = String(
    row.ticket ?? row.internal_number ?? row.ticket_number ?? '-',
  )

  const team = String(row.team ?? row.team_name ?? '-')

  return {
    id,
    ticket: chamado,
    completed_at: pickOptionalDate(
      row,
      'completed_at',
      'completed_at',
      'concluded_at',
    ),
    requester_operation: String(
      row.requester_operation ?? row.requester_operation_nome ?? '-',
    ),
    team,
    teams: parseArchiveTeams(row.teams, team),
    assignee: String(row.assignee ?? row.assignee_nome ?? '-'),
    services: parseServices(row.services ?? row.services),
    status: String(row.status ?? row.situacao ?? '-'),
    sei_filled: parseSeiPreenchido(row.sei_filled),
  }
}

const ARCHIVE_EXPORT_PAGE_SIZE = 200

type TicketArchiveQueryFilters = Omit<
  TicketArchiveFilters,
  'page' | 'page_size'
>

async function fetchAllTicketArchiveItems(
  filters: TicketArchiveQueryFilters,
): Promise<TicketArchiveListItem[]> {
  const all: TicketArchiveListItem[] = []
  let page = 1
  let total = 0

  for (;;) {
    const res = await getTicketArchive({
      ...filters,
      page,
      page_size: ARCHIVE_EXPORT_PAGE_SIZE,
    })
    total = res.total
    const batch = (res.items ?? []).map((item) => normalizeArchiveItem(item))
    all.push(...batch)
    if (batch.length === 0 || all.length >= total) break
    page += 1
    if (page > 10_000) break
  }

  return all
}

function escapeCsvCell(value: string): string {
  const needsQuotes = /[",\n\r]/.test(value)
  const escaped = value.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function buildArchiveCsv(rows: TicketArchiveListItem[]): string {
  const header = [
    'CHAMADO',
    'DATA CONCLUSÃO',
    'DEMANDANTE',
    'EQUIPE',
    'RESPONSÁVEL',
    'SERVIÇOS',
    'STATUS',
  ]
    .map(escapeCsvCell)
    .join(',')

  const body = rows
    .map((item) =>
      [
        item.ticket,
        formatArchiveDate(item.completed_at),
        item.requester_operation,
        (item.teams?.length ? item.teams.map((team) => team.name) : [item.team])
          .filter(Boolean)
          .join('; '),
        item.assignee,
        item.services.join('; '),
        item.status,
      ]
        .map(escapeCsvCell)
        .join(','),
    )
    .join('\r\n')

  return `\uFEFF${header}\r\n${body}`
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

export function TicketArchiveList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [appliedFilters, setAppliedFilters] =
    useState<TicketArchiveFilterState>(emptyArchiveFilters())
  const debouncedSearch = useDebounce(search, 350)

  const archiveQueryFilters = useMemo<TicketArchiveQueryFilters>(
    () => ({
      search: debouncedSearch.trim() || undefined,
      operation_id: appliedFilters.operation_id.map((item) => item.value),
      requester: appliedFilters.requester.length
        ? appliedFilters.requester.map((item) => item.value)
        : undefined,
      assignee_id: appliedFilters.assignee_id.length
        ? appliedFilters.assignee_id.map((item) => item.value)
        : undefined,
      participant_id: appliedFilters.participant_id.length
        ? appliedFilters.participant_id.map((item) => item.value)
        : undefined,
      base_date_start: appliedFilters.base_date_start || undefined,
      base_date_end: appliedFilters.base_date_end || undefined,
      entry_date_start: appliedFilters.entry_date_start || undefined,
      entry_date_end: appliedFilters.entry_date_end || undefined,
      priority: appliedFilters.priority.map((item) => item.value),
      team: appliedFilters.team.map((item) => item.value),
      services: appliedFilters.services.map(
        (item) => item.value,
      ) as TicketArchiveFilters['services'],
    }),
    [appliedFilters, debouncedSearch],
  )

  const payload = useMemo<TicketArchiveFilters>(
    () => ({
      ...archiveQueryFilters,
      page,
      page_size: pageSize,
    }),
    [archiveQueryFilters, page, pageSize],
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['tickets-archive', payload],
    queryFn: () => getTicketArchive(payload),
    staleTime: 1000 * 60,
    refetchOnMount: 'always',
  })

  const items = useMemo(
    () => (data?.items ?? []).map((item) => normalizeArchiveItem(item)),
    [data?.items],
  )

  const activeFiltersCount = useMemo(
    () =>
      [
        appliedFilters.operation_id.length,
        appliedFilters.requester.length,
        appliedFilters.assignee_id.length,
        appliedFilters.participant_id.length,
        appliedFilters.priority.length,
        appliedFilters.team.length,
        appliedFilters.services.length,
        appliedFilters.base_date_start ? 1 : 0,
        appliedFilters.base_date_end ? 1 : 0,
        appliedFilters.entry_date_start ? 1 : 0,
        appliedFilters.entry_date_end ? 1 : 0,
      ].reduce((acc, value) => acc + value, 0),
    [appliedFilters],
  )

  const clearFilters = () => {
    setAppliedFilters(emptyArchiveFilters())
    setPage(1)
  }

  const handleExportCsv = useCallback(async () => {
    setIsExporting(true)
    try {
      const rows = await fetchAllTicketArchiveItems(archiveQueryFilters)
      if (rows.length === 0) {
        toast.message('Nenhum chamado para exportar com os filtros atuais.')
        return
      }
      const csv = buildArchiveCsv(rows)
      const dateStamp = new Date().toISOString().slice(0, 10)
      triggerCsvDownload(csv, `arquivo-chamados-${dateStamp}.csv`)
      toast.success(`Exportação concluída (${rows.length} linhas).`)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsExporting(false)
    }
  }, [archiveQueryFilters])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Arquivo de Chamados</h1>
        <p>Procure abaixo os chamados concluídos e arquivados</p>
      </header>

      <section className={styles.toolbar}>
        <ArchiveSearchField
          search={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
        />

        <div className={styles.toolbarActions}>
          {activeFiltersCount > 0 ? (
            <button
              type="button"
              className={styles.clearFilters}
              onClick={clearFilters}
            >
              Limpar filtro
            </button>
          ) : null}

          <Button
            type="button"
            className={styles.actionButton}
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
            className={styles.actionButton}
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter size={16} />
            Filtrar {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
          </Button>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>CHAMADO</th>
                <th>DATA CONCLUSÃO</th>
                <th>DEMANDANTE</th>
                <th>EQUIPE</th>
                <th>RESPONSÁVEL</th>
                <th>SERVIÇOS</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>
                    Carregando arquivo...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>
                    Nenhum chamado encontrado.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const previewServices = item.services.slice(0, 2)
                  const extraCount = Math.max(
                    item.services.length - previewServices.length,
                    0,
                  )
                  const archiveTeams = item.teams ?? [
                    { name: item.team, people: [] },
                  ]
                  const previewTeams = archiveTeams.slice(0, 2)
                  const extraTeams = archiveTeams.slice(2)

                  return (
                    <tr key={`${item.id}-${item.ticket}`}>
                      <td>
                        <div className={styles.chamadoCell}>
                          <Link
                            href={
                              item.id
                                ? `/demandas/${encodeURIComponent(item.id)}`
                                : '#'
                            }
                            className={styles.chamadoLink}
                          >
                            {item.ticket}
                          </Link>
                          {item.sei_filled ? (
                            <Tooltip asChild text={SEI_PREENCHIDO_TOOLTIP}>
                              <span
                                className={styles.seiTooltipTrigger}
                                aria-label={SEI_PREENCHIDO_TOOLTIP}
                              >
                                <FileText
                                  className={styles.seiIcon}
                                  size={14}
                                  aria-hidden
                                />
                              </span>
                            </Tooltip>
                          ) : null}
                        </div>
                      </td>
                      <td>{formatArchiveDate(item.completed_at)}</td>
                      <td>{item.requester_operation}</td>
                      <td>
                        {archiveTeams.length > 0 ? (
                          <div className={styles.teamsCell}>
                            {previewTeams.map((team, index) => (
                              <Tooltip
                                key={`${item.id}-team-${team.name}-${index}`}
                                asChild
                                side="bottom"
                                className={styles.teamTooltipSurface}
                                render={
                                  <div className={styles.teamTooltipDetails}>
                                    {team.people.map((person) => (
                                      <span
                                        key={`${item.id}-${team.name}-${person}`}
                                        className={styles.participantName}
                                      >
                                        {person}
                                      </span>
                                    ))}
                                  </div>
                                }
                              >
                                <span className={styles.teamTag}>
                                  {team.name}
                                </span>
                              </Tooltip>
                            ))}
                            {extraTeams.length > 0 ? (
                              <Tooltip
                                asChild
                                side="bottom"
                                className={styles.teamTooltipSurface}
                                render={
                                  <div className={styles.teamTooltipDetails}>
                                    {extraTeams.map((team, index) => (
                                      <div
                                        key={`${item.id}-extra-team-${team.name}-${index}`}
                                        className={styles.extraTeamDetails}
                                      >
                                        <span className={styles.extraTeamName}>
                                          {team.name}
                                        </span>
                                        {team.people.map((person) => (
                                          <span
                                            key={`${item.id}-${team.name}-${person}`}
                                            className={styles.participantName}
                                          >
                                            {person}
                                          </span>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                }
                              >
                                <span className={styles.extraTag}>
                                  +{extraTeams.length}
                                </span>
                              </Tooltip>
                            ) : null}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{item.assignee}</td>
                      <td>
                        <div className={styles.servicesCell}>
                          {previewServices.map((service, index) => (
                            <span
                              key={`${item.id}-${service}-${index}`}
                              className={`${styles.serviceTag} ${getServiceTagClass(service)}`}
                            >
                              <Tag
                                className={styles.serviceTagIcon}
                                strokeWidth={2}
                              />
                              <span>{service}</span>
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
                                        key={`${item.id}-extra-${service}-${index}`}
                                        className={`${styles.serviceTag} ${getServiceTagClass(service)}`}
                                      >
                                        <Tag
                                          className={styles.serviceTagIcon}
                                          strokeWidth={2}
                                        />
                                        {service}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span className={styles.statusBadge}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.paginationWrap}>
          <Pagination
            page={data?.page ?? page}
            total={data?.total ?? 0}
            size={data?.page_size ?? pageSize}
            onPageChange={async (nextPage) => setPage(nextPage)}
          />
        </div>
      </section>

      {isFetching && !isLoading ? (
        <p className={styles.fetchingText}>Atualizando dados...</p>
      ) : null}

      <TicketArchiveFiltersModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={appliedFilters}
        onApply={(filters) => {
          setAppliedFilters(filters)
          setPage(1)
        }}
      />
    </div>
  )
}
