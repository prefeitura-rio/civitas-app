'use client'
import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import { formatDate } from 'date-fns'

import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useMonitoredPlatesHistorySearchParams } from '@/hooks/useParams/useMonitoredPlatesHistorySearchParams'
import { useMonitoredPlatesHistory } from '@/hooks/useQueries/cars/monitored/useMonitoredPlatesHistory'
import type { MonitoredPlateHistorySortBy } from '@/http/cars/monitored/get-monitored-plates-history'
import type { MonitoredPlateHistoryItem } from '@/models/entities'

function historyRowId(item: MonitoredPlateHistoryItem) {
  return [
    item.source,
    item.monitored_plate_authority_id ?? item.plate,
    item.created_timestamp ?? '',
    item.deleted_timestamp ?? '',
  ].join('|')
}

export function HistoryTable() {
  const { formattedSearchParams, handlePaginate, handleSorting } =
    useMonitoredPlatesHistorySearchParams()
  const { data, isLoading: isMonitoredPlatesLoading } =
    useMonitoredPlatesHistory()

  const columns: ColumnDef<MonitoredPlateHistoryItem>[] = [
    {
      accessorKey: 'source',
      header: 'Origem',
      enableSorting: true,
      cell: ({ row }) =>
        row.original.source === 'authority' ? 'Vínculo' : 'Legado',
    },
    {
      accessorKey: 'plate',
      header: 'Placa',
      enableSorting: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) =>
        row.original.deleted_timestamp ? 'Desativada' : 'Ativa',
    },
    {
      accessorKey: 'reference_number',
      header: 'Número de referência',
      enableSorting: true,
      cell: ({ row }) => row.original.reference_number || '—',
    },
    {
      accessorKey: 'notes',
      header: 'Observações',
      enableSorting: true,
      cell: ({ row }) => row.original.notes || '—',
    },
    {
      accessorKey: 'created_timestamp',
      header: 'Data de criação',
      enableSorting: true,
      cell: ({ row }) =>
        row.original.created_timestamp
          ? formatDate(row.original.created_timestamp, 'dd/MM/yyyy HH:mm')
          : '—',
    },
    {
      id: 'created_by',
      header: 'Criado por',
      enableSorting: true,
      accessorFn: (row) => row.created_by?.full_name,
      cell: ({ row }) => row.original.created_by?.full_name || '—',
    },
    {
      accessorKey: 'deleted_timestamp',
      header: 'Data de desativação',
      enableSorting: true,
      cell: ({ row }) =>
        row.original.deleted_timestamp
          ? formatDate(row.original.deleted_timestamp, 'dd/MM/yyyy HH:mm')
          : '—',
    },
    {
      id: 'deleted_by',
      header: 'Desativado por',
      enableSorting: true,
      accessorFn: (row) => row.deleted_by?.full_name,
      cell: ({ row }) => row.original.deleted_by?.full_name || '—',
    },
  ]

  const items = data?.items || []
  const sortingState: SortingState = formattedSearchParams.sortBy
    ? [
        {
          id: formattedSearchParams.sortBy,
          desc: formattedSearchParams.sortDirection === 'desc',
        },
      ]
    : []

  function handleSortingChange(
    updater: SortingState | ((prev: SortingState) => SortingState),
  ) {
    const nextSorting =
      typeof updater === 'function' ? updater(sortingState) : updater
    const nextSort = nextSorting[0]

    handleSorting(
      nextSort?.id as MonitoredPlateHistorySortBy | undefined,
      nextSort ? (nextSort.desc ? 'desc' : 'asc') : undefined,
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <DataTable
        columns={columns}
        data={items}
        isLoading={isMonitoredPlatesLoading}
        getRowId={(row) => historyRowId(row)}
        sorting
        sortingState={sortingState}
        onSortingChange={handleSortingChange}
        manualSorting
      />
      {data && (
        <Pagination
          page={data.page}
          total={data.total}
          size={data.size}
          onPageChange={handlePaginate}
        />
      )}
    </div>
  )
}
