'use client'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { PencilLine, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useMonitoredPlatesSearchParams } from '@/hooks/params/use-monitored-plates-search-params'
import { useMonitoredPlates } from '@/hooks/use-monitored-plates'
import { getMonitoredPlates } from '@/http/cars/monitored/get-monitored-plates'
import type { MonitoredPlate } from '@/models/entities'

export function MonitoredPlatesTable() {
  const { formattedSearchParams, queryKey, handlePaginate } =
    useMonitoredPlatesSearchParams()
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteMonitoredPlateProps,
    deleteAlertDisclosure,
  } = useMonitoredPlates()

  const { data: response, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      getMonitoredPlates({
        ...formattedSearchParams,
      }),
  })

  const data = response?.data

  const columns: ColumnDef<MonitoredPlate>[] = [
    {
      accessorKey: 'plate',
      header: 'Placa',
    },
    {
      accessorKey: 'notes',
      header: 'Observações',
    },
    {
      accessorKey: 'operation.title',
      header: 'Operação',
    },
    {
      accessorKey: 'notificationChannels',
      header: 'Canais de notificação',
      cell: ({ row }) => {
        console.log({ row })
        if (row.original.notificationChannels) {
          const concatenated = row.original.notificationChannels.reduce(
            (acc, cur) => (acc ? `${acc}, ${cur.title}` : cur.title),
            '',
          )
          return <span>{concatenated}</span>
        } else {
          return <div />
        }
      },
    },
    {
      id: 'actions',
      header: () => (
        <div className="flex justify-end">
          <p className="w-[4.5rem] text-center">Ações</p>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              type="button"
              onClick={() => {
                setDialogInitialData({ id: row.original.id })
                formDialogDisclosure.onOpen()
              }}
            >
              <span className="sr-only">Editar linha</span>
              <PencilLine className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              type="button"
              onClick={() => {
                setOnDeleteMonitoredPlateProps({
                  plate: row.original.plate,
                })
                deleteAlertDisclosure.onOpen()
              }}
            >
              <span className="sr-only">Excluir linha</span>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="page-content flex flex-col gap-8 pt-8">
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
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
