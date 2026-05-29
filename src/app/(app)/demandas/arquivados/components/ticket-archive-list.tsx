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

import {
  ArchiveSearchField,
  emptyArchiveFilters,
  TicketArchiveFiltersModal,
  type TicketArchiveFilterState,
} from './ticket-archive-filters'
import styles from './ticket-archive-list.module.css'

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
  if (normalized.includes('atlas')) return styles.serviceTagDefault

  return styles.serviceTagDefault
}

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
    row.chamado ?? row.numero_interno ?? row.ticket_number ?? '-',
  )

  return {
    id,
    chamado,
    data_conclusao: pickOptionalDate(
      row,
      'data_conclusao',
      'completed_at',
      'concluded_at',
    ),
    demandante: String(row.demandante ?? row.demandante_nome ?? '-'),
    equipe: String(row.equipe ?? row.team_name ?? '-'),
    responsavel: String(row.responsavel ?? row.responsavel_nome ?? '-'),
    servicos: parseServices(row.servicos ?? row.services),
    status: String(row.status ?? row.situacao ?? '-'),
    sei_preenchido: parseSeiPreenchido(row.sei_preenchido),
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
        item.chamado,
        formatArchiveDate(item.data_conclusao),
        item.demandante,
        item.equipe,
        item.responsavel,
        item.servicos.join('; '),
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
      demandante_id: appliedFilters.demandante_id.map((item) => item.value),
      requisitante: appliedFilters.requisitante.length
        ? appliedFilters.requisitante.map((item) => item.value)
        : undefined,
      responsavel_id: appliedFilters.responsavel_id.length
        ? appliedFilters.responsavel_id.map((item) => item.value)
        : undefined,
      data_base_inicio: appliedFilters.data_base_inicio || undefined,
      data_base_fim: appliedFilters.data_base_fim || undefined,
      data_entrada_inicio: appliedFilters.data_entrada_inicio || undefined,
      data_entrada_fim: appliedFilters.data_entrada_fim || undefined,
      prioridade: appliedFilters.prioridade.map((item) => item.value),
      equipe: appliedFilters.equipe.map((item) => item.value),
      servicos: appliedFilters.servicos.map(
        (item) => item.value,
      ) as TicketArchiveFilters['servicos'],
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
        appliedFilters.demandante_id.length,
        appliedFilters.requisitante.length,
        appliedFilters.responsavel_id.length,
        appliedFilters.prioridade.length,
        appliedFilters.equipe.length,
        appliedFilters.servicos.length,
        appliedFilters.data_base_inicio ? 1 : 0,
        appliedFilters.data_base_fim ? 1 : 0,
        appliedFilters.data_entrada_inicio ? 1 : 0,
        appliedFilters.data_entrada_fim ? 1 : 0,
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
                  const previewServices = item.servicos.slice(0, 2)
                  const extraCount = Math.max(
                    item.servicos.length - previewServices.length,
                    0,
                  )

                  return (
                    <tr key={`${item.id}-${item.chamado}`}>
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
                            {item.chamado}
                          </Link>
                          {item.sei_preenchido ? (
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
                      <td>{formatArchiveDate(item.data_conclusao)}</td>
                      <td>{item.demandante}</td>
                      <td>{item.equipe}</td>
                      <td>{item.responsavel}</td>
                      <td>
                        <div className={styles.servicesCell}>
                          {previewServices.map((service, index) => (
                            <span
                              key={`${item.id}-${service}-${index}`}
                              className={`${styles.serviceTag} ${getServiceClassName(service)}`}
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
                                  {item.servicos
                                    .slice(2)
                                    .map((service, index) => (
                                      <span
                                        key={`${item.id}-extra-${service}-${index}`}
                                        className={`${styles.serviceTag} ${getServiceClassName(service)}`}
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
