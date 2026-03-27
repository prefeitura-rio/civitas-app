'use client'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { PencilLine, Trash } from 'lucide-react'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useDemandantsContext } from '@/hooks/useContexts/use-demandants-context'
import { useDemandantsSearchParams } from '@/hooks/useParams/useDemandantsSearchParams'
import { useProfile } from '@/hooks/useQueries/useProfile'
import { getDemandants } from '@/http/demandants/get-demandants'
import type { Demandant } from '@/models/entities'
import { notAllowed } from '@/utils/template-messages'

export function DemandantsTable() {
  const { formattedSearchParams, queryKey, handlePaginate } =
    useDemandantsSearchParams()
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteDemandantProps,
    deleteAlertDisclosure,
  } = useDemandantsContext()
  const { data: profile } = useProfile()

  const { data: response, isLoading } = useQuery({
    queryKey,
    queryFn: () => getDemandants({ ...formattedSearchParams }),
  })

  const data = response?.data

  const columns: ColumnDef<Demandant>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'email',
      header: 'E-mail',
    },
    {
      accessorKey: 'phone1',
      header: 'Telefone 1',
    },
    {
      id: 'organization',
      header: 'Organização',
      cell: ({ row }) => (
        <span>
          {row.original.organization.name} ({row.original.organization.acronym})
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Criado em',
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
                  setOnDeleteDemandantProps({
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
          onPageChange={handlePaginate}
        />
      )}
    </div>
  )
}
