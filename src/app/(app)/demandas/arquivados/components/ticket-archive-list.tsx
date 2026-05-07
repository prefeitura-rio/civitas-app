'use client'

import { useQuery } from '@tanstack/react-query'
import { Download, Filter, Tag } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { useDebounce } from '@/components/custom/multiselect-with-search'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import {
  getTicketArchive,
  type TicketArchiveFilters,
  type TicketArchiveListItem,
} from '@/http/tickets/get-ticket-archive'

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

function normalizeArchiveItem(item: unknown): TicketArchiveListItem {
  const row = (item as Record<string, unknown>) ?? {}

  const id = String(row.id ?? row.ticket_id ?? '')
  const chamado = String(
    row.chamado ?? row.numero_interno ?? row.ticket_number ?? '-',
  )

  return {
    id,
    chamado,
    demandante: String(row.demandante ?? row.demandante_nome ?? '-'),
    equipe: String(row.equipe ?? row.team_name ?? '-'),
    responsavel: String(row.responsavel ?? row.responsavel_nome ?? '-'),
    servicos: parseServices(row.servicos ?? row.services),
    status: String(row.status ?? row.situacao ?? '-'),
  }
}

export function TicketArchiveList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] =
    useState<TicketArchiveFilterState>(emptyArchiveFilters())
  const debouncedSearch = useDebounce(search, 350)

  const payload = useMemo<TicketArchiveFilters>(
    () => ({
      search: debouncedSearch.trim() || undefined,
      page,
      page_size: pageSize,
      demandante_id: appliedFilters.demandante_id.map((item) => item.value),
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
    [appliedFilters, debouncedSearch, page, pageSize],
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['tickets-archive', payload],
    queryFn: () => getTicketArchive(payload),
    staleTime: 1000 * 60,
  })

  const items = useMemo(
    () => (data?.items ?? []).map((item) => normalizeArchiveItem(item)),
    [data?.items],
  )

  const activeFiltersCount = useMemo(
    () =>
      [
        appliedFilters.demandante_id.length,
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

          <Button type="button" className={styles.actionButton}>
            <Download size={16} />
            Exportar
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
                  <td colSpan={6} className={styles.emptyRow}>
                    Carregando arquivo...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    Nenhum chamado encontrado.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={`${item.id}-${item.chamado}`}>
                    <td>
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
                    </td>
                    <td>{item.demandante}</td>
                    <td>{item.equipe}</td>
                    <td>{item.responsavel}</td>
                    <td>
                      <div className={styles.servicesCell}>
                        {item.servicos.slice(0, 3).map((service) => (
                          <span
                            key={`${item.id}-${service}`}
                            className={`${styles.serviceTag} ${getServiceClassName(service)}`}
                          >
                            <Tag size={12} />
                            {service}
                          </span>
                        ))}

                        {item.servicos.length > 3 ? (
                          <span className={styles.extraTag}>
                            +{item.servicos.length - 3}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <span className={styles.statusBadge}>{item.status}</span>
                    </td>
                  </tr>
                ))
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
