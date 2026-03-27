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
import { useOrganizations } from '@/hooks/useContexts/use-organizations-context'
import { useProfile } from '@/hooks/useQueries/useProfile'
import { getOrganizations } from '@/http/organizations/get-organizations'
import type { Organization } from '@/models/entities'
import { notAllowed } from '@/utils/template-messages'

export function OrganizationsTable() {
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteOrganizationProps,
    deleteAlertDisclosure,
  } = useOrganizations()
  const { data: profile } = useProfile()

  const { data: response, isLoading } = useQuery({
    queryKey: ['organizations', page, size],
    queryFn: () => getOrganizations({ page, size }),
  })

  const data = response?.data

  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'organizationType',
      header: 'Tipo',
    },
    {
      accessorKey: 'acronym',
      header: 'Sigla',
    },
    {
      accessorKey: 'jurisdictionLevel',
      header: 'Jurisdição',
    },
    {
      accessorKey: 'createdAt',
      header: 'Criada em',
      cell: ({ row }) => formatDate(row.original.createdAt, 'dd/MM/yyyy HH:mm'),
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
                  setOnDeleteOrganizationProps({
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
