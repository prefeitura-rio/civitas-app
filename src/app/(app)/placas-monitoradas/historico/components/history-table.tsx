'use client'
import { type ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'

import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useMonitoredPlatesHistorySearchParams } from '@/hooks/useParams/useMonitoredPlatesHistorySearchParams'
import { useMonitoredPlatesHistory } from '@/hooks/useQueries/cars/monitored/useMonitoredPlatesHistory'
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
  const { handlePaginate } = useMonitoredPlatesHistorySearchParams()
  const { data, isLoading: isMonitoredPlatesLoading } =
    useMonitoredPlatesHistory()

  const columns: ColumnDef<MonitoredPlateHistoryItem>[] = [
    {
      accessorKey: 'source',
      header: 'Origem',
      cell: ({ row }) =>
        row.original.source === 'authority' ? 'Vínculo' : 'Legado',
    },
    {
      accessorKey: 'plate',
      header: 'Placa',
    },
    {
      accessorKey: 'reference_number',
      header: 'Nº referência',
      cell: ({ row }) => row.original.reference_number ?? null,
    },
    {
      accessorKey: 'notes',
      header: 'Observações',
    },
    {
      accessorKey: 'created_timestamp',
      header: 'Data de criação',
      cell: ({ row }) =>
        row.original.created_timestamp
          ? formatDate(row.original.created_timestamp, 'dd/MM/yyyy HH:mm')
          : null,
    },
    {
      accessorKey: 'created_by.full_name',
      header: 'Criado por',
      cell: ({ row }) => row.original.created_by?.full_name,
    },
    {
      accessorKey: 'deleted_timestamp',
      header: 'Data de desativação',
      cell: ({ row }) =>
        row.original.deleted_timestamp
          ? formatDate(row.original.deleted_timestamp, 'dd/MM/yyyy HH:mm')
          : null,
    },
    {
      accessorKey: 'deleted_by.full_name',
      header: 'Desativado por',
      cell: ({ row }) => row.original.deleted_by?.full_name,
    },
  ]

  const items = data?.items || []

  return (
    <div className="flex flex-col gap-8">
      <DataTable
        columns={columns}
        data={items}
        isLoading={isMonitoredPlatesLoading}
        getRowId={(row) => historyRowId(row)}
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
