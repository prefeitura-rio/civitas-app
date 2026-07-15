'use client'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { PencilLine, Trash } from 'lucide-react'
import { useState } from 'react'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useRequestingInstitutions } from '@/hooks/useContexts/use-requesting-institutions-context'
import { useProfile } from '@/hooks/useQueries/useProfile'
import {
  getRequestingInstitutions,
  type RequestingInstitution,
} from '@/http/requesting-institutions'
import { notAllowed } from '@/utils/template-messages'

const jurisdictionLabels: Record<
  RequestingInstitution['jurisdictionLevel'],
  string
> = {
  municipal: 'Municipal',
  estadual: 'Estadual',
  distrital: 'Distrital',
  federal: 'Federal',
  outros: 'Outros',
}

export function RequestingInstitutionsTable() {
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteRequestingInstitutionProps,
    deleteAlertDisclosure,
  } = useRequestingInstitutions()
  const { data: profile } = useProfile()

  const { data: response, isLoading } = useQuery({
    queryKey: ['requesting-institutions', page, size],
    queryFn: () => getRequestingInstitutions({ page, size }),
  })

  const data = response?.data

  const columns: ColumnDef<RequestingInstitution>[] = [
    {
      accessorKey: 'name',
      header: 'Demandante',
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
    },
    {
      accessorKey: 'agency',
      header: 'Órgão',
    },
    {
      accessorKey: 'jurisdictionLevel',
      header: 'Competência',
      cell: ({ row }) => jurisdictionLabels[row.original.jurisdictionLevel],
    },
    {
      accessorKey: 'createdAt',
      header: 'Criada em',
      cell: ({ row }) =>
        row.original.createdAt
          ? formatDate(row.original.createdAt, 'dd/MM/yyyy HH:mm')
          : '—',
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
              text="Editar"
              disabledText={notAllowed}
              disabled={!profile?.is_admin}
              asChild
            >
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => {
                  setDialogInitialData({ id: row.original.id })
                  formDialogDisclosure.onOpen()
                }}
                disabled={!profile?.is_admin}
              >
                <span className="sr-only">Editar</span>
                <PencilLine className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip
              text="Excluir"
              disabledText={notAllowed}
              disabled={!profile?.is_admin}
              asChild
            >
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                type="button"
                onClick={() => {
                  setOnDeleteRequestingInstitutionProps({
                    id: row.original.id,
                    name: row.original.name,
                  })
                  deleteAlertDisclosure.onOpen()
                }}
                disabled={!profile?.is_admin}
              >
                <span className="sr-only">Excluir</span>
                <Trash className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
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
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
