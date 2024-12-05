'use client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { PencilLine, Trash } from 'lucide-react'
import { useState } from 'react'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { Switch } from '@/components/ui/switch'
import { useMonitoredPlates } from '@/hooks/use-contexts/use-monitored-plates-context'
import { useMonitoredPlatesSearchParams } from '@/hooks/use-params/use-monitored-plates-search-params'
import { useProfile } from '@/hooks/use-queries/use-profile'
import { getMonitoredPlates } from '@/http/cars/monitored/get-monitored-plates'
import { updateMonitoredPlate } from '@/http/cars/monitored/update-monitored-plate'
import { queryClient } from '@/lib/react-query'
import type { MonitoredPlate } from '@/models/entities'
import { notAllowed } from '@/utils/template-messages'

export function MonitoredPlatesTable() {
  const { formattedSearchParams, queryKey, handlePaginate } =
    useMonitoredPlatesSearchParams()
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteMonitoredPlateProps,
    deleteAlertDisclosure,
  } = useMonitoredPlates()
  const [plate, setPlate] = useState<string>()
  const { data: profile, isLoading: isProfileLoading } = useProfile()

  const { data: MonitoredPlatesResponse, isLoading: isMonitoredPlatesLoading } =
    useQuery({
      queryKey,
      queryFn: () =>
        getMonitoredPlates({
          ...formattedSearchParams,
        }),
    })

  const {
    mutateAsync: updateMonitoredPlateMutation,
    isPending: IsUpdatingLoading,
  } = useMutation({
    mutationFn: updateMonitoredPlate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars', 'monitored'] })
    },
  })

  const data = MonitoredPlatesResponse?.data

  const columns: ColumnDef<MonitoredPlate>[] = [
    {
      accessorKey: 'plate',
      header: 'Placa',
    },
    {
      accessorKey: 'contactInfo',
      header: 'Contatos',
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
      accessorKey: 'createdAt',
      header: 'Data de criação',
      cell: ({ row }) => formatDate(row.original.createdAt, 'dd/MM/yyyy HH:mm'),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Última atualização',
      cell: ({ row }) => formatDate(row.original.updatedAt, 'dd/MM/yyyy HH:mm'),
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => {
        return (
          <Tooltip
            text={row.original.active ? 'Ativo' : 'Inativo'}
            disabled={
              (IsUpdatingLoading && plate === row.original.plate) ||
              !profile ||
              !profile?.is_admin
            }
            disabledText={notAllowed}
            asChild
          >
            <div>
              <Switch
                id="active"
                size="sm"
                checked={row.original.active}
                disabled={
                  (IsUpdatingLoading && plate === row.original.plate) ||
                  !profile ||
                  !profile?.is_admin
                }
                className="disabled:cursor-default"
                onCheckedChange={() => {
                  setPlate(row.original.plate)
                  updateMonitoredPlateMutation({
                    plate: row.original.plate,
                    active: !row.original.active,
                  })
                }}
              />
            </div>
          </Tooltip>
        )
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
            <Tooltip
              disabled={!profile || !profile?.is_admin}
              disabledText={notAllowed}
              text="Editar"
              asChild
            >
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => {
                  setDialogInitialData({ plate: row.original.plate })
                  formDialogDisclosure.onOpen()
                }}
                disabled={!profile || !profile?.is_admin}
              >
                <span className="sr-only">Editar linha</span>
                <PencilLine className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip
              text={'Excluir'}
              disabled={
                (IsUpdatingLoading && plate === row.original.plate) ||
                !profile ||
                !profile?.is_admin
              }
              disabledText={notAllowed}
              asChild
            >
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
                disabled={
                  (IsUpdatingLoading && plate === row.original.plate) ||
                  !profile ||
                  !profile?.is_admin
                }
              >
                <span className="sr-only">Excluir linha</span>
                <Trash className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isMonitoredPlatesLoading || isProfileLoading}
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
