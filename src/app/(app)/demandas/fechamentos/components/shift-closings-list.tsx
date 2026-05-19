'use client'

import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import {
  getTicketShiftClosings,
  type TicketShiftClosingFilters,
  type TicketShiftClosingListItem,
} from '@/http/tickets/get-ticket-shift-closings'
import { dateConfig } from '@/lib/date-config'

import {
  emptyShiftClosingsFilters,
  ShiftClosingsFilters,
  type ShiftClosingsFilterState,
} from './shift-closings-filters'
import styles from './shift-closings-list.module.css'

function formatShiftDate(value: string): string {
  if (!value?.trim()) return '-'
  try {
    const normalized = value.includes('T') ? value : `${value}T00:00:00`
    return format(parseISO(normalized), dateConfig.formats.date, {
      locale: dateConfig.locale,
    })
  } catch {
    return value
  }
}

function formatClosedAt(value: string): string {
  if (!value?.trim()) return '-'
  try {
    return format(parseISO(value), 'dd/MM/yyyy HH:mm', {
      locale: dateConfig.locale,
    })
  } catch {
    return value
  }
}

export function ShiftClosingsList() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [filters, setFilters] = useState<ShiftClosingsFilterState>(
    emptyShiftClosingsFilters(),
  )

  const queryFilters = useMemo<TicketShiftClosingFilters>(
    () => ({
      closed_by_id: filters.closed_by_id || undefined,
      team_id: filters.team_id || undefined,
      shift_date: filters.shift_date || undefined,
      page,
      page_size: pageSize,
    }),
    [filters, page, pageSize],
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['ticket-shift-closings', queryFilters],
    queryFn: () => getTicketShiftClosings(queryFilters),
    staleTime: 1000 * 60,
    refetchOnMount: 'always',
  })

  const items: TicketShiftClosingListItem[] = data?.items ?? []

  const handleFiltersChange = (next: ShiftClosingsFilterState) => {
    setFilters(next)
    setPage(1)
  }

  return (
    <div className={styles.container}>
      <section className={styles.topActions}>
        <Button type="button" className={styles.closeShiftButton} asChild>
          <Link href="/demandas/fechamentos/fechar">Fechar turno</Link>
        </Button>

        <ShiftClosingsFilters
          filters={filters}
          onChange={handleFiltersChange}
        />
      </section>

      <section className={styles.tableCard}>
        <header className={styles.tableCardHeader}>
          <div className={styles.tableCardHeaderLeft}>
            <span className={styles.sectionBadge}>Fechados no turno</span>
            <span className={styles.sectionCount}>{data?.total ?? 0}</span>
          </div>
          <button
            type="button"
            className={styles.collapseButton}
            onClick={() => setIsCollapsed((current) => !current)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Expandir tabela' : 'Recolher tabela'}
          >
            {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </header>

        {!isCollapsed ? (
          <div className={styles.tableBody}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.colShiftDate}>Data do turno</th>
                    <th className={styles.colClosedAt}>Data de fechamento</th>
                    <th className={styles.colAdjunct}>Adjunto</th>
                    <th className={styles.colTeam}>Equipe</th>
                    <th
                      className={`${styles.colTicketCount} ${styles.colTicketCountHeader}`}
                    >
                      Quantidade de chamados
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className={styles.emptyRow}>
                        Carregando fechamentos...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.emptyRow}>
                        Nenhum fechamento encontrado.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td className={styles.colShiftDate}>
                          <Link
                            href={`/demandas/fechamentos/${encodeURIComponent(item.id)}`}
                            className={styles.shiftDateLink}
                          >
                            {formatShiftDate(item.shift_date)}
                          </Link>
                        </td>
                        <td className={styles.colClosedAt}>
                          {formatClosedAt(item.closed_at)}
                        </td>
                        <td className={styles.colAdjunct}>{item.adjunct}</td>
                        <td className={styles.colTeam}>{item.team}</td>
                        <td className={styles.colTicketCount}>
                          {item.ticket_count}
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
          </div>
        ) : null}
      </section>

      {isFetching && !isLoading ? (
        <p className={styles.fetchingText}>Atualizando dados...</p>
      ) : null}
    </div>
  )
}
