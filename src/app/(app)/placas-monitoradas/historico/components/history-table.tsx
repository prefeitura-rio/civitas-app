'use client'
import { type ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'

import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useMonitoredPlatesHistorySearchParams } from '@/hooks/use-params/use-monitored-plates-history-search-params'
import { useMonitoredPlatesHistory } from '@/hooks/use-queries/cars/monitored/use-monitored-plates-history'
import type { MonitoredPlateHistoryItem } from '@/models/entities'

export function HistoryTable() {
  const { handlePaginate } = useMonitoredPlatesHistorySearchParams()
  const { data, isLoading: isMonitoredPlatesLoading } =
    useMonitoredPlatesHistory()

  const columns: ColumnDef<MonitoredPlateHistoryItem>[] = [
    {
      accessorKey: 'plate',
      header: 'Placa',
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
      header: 'Data de exclusão',
      cell: ({ row }) =>
        row.original.deleted_timestamp
          ? formatDate(row.original.deleted_timestamp, 'dd/MM/yyyy HH:mm')
          : null,
    },
    {
      accessorKey: 'deleted_by.full_name',
      header: 'Excluído por',
      cell: ({ row }) => row.original.deleted_by?.full_name,
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isMonitoredPlatesLoading}
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
