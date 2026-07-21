'use client'
import { useQuery } from '@tanstack/react-query'
import {
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
} from '@tanstack/react-table'
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
  type RequestingInstitutionSortBy,
  type SortDirection,
} from '@/http/requesting-institutions'
import { notAllowed } from '@/utils/template-messages'

const sortableColumns = {
  name: 'name',
  type: 'type',
  agency: 'agency',
  jurisdiction_level: 'jurisdiction_level',
  created_at: 'created_at',
} as const satisfies Record<string, RequestingInstitutionSortBy>

function getSortBy(sortingState: SortingState) {
  const columnId = sortingState[0]?.id

  if (!columnId) return undefined

  return sortableColumns[columnId as keyof typeof sortableColumns]
}

function getSortDirection(
  sortingState: SortingState,
): SortDirection | undefined {
  const sort = sortingState[0]

  if (!sort) return undefined

  return sort.desc ? 'desc' : 'asc'
}

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
  const [sortingState, setSortingState] = useState<SortingState>([])
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteRequestingInstitutionProps,
    deleteAlertDisclosure,
  } = useRequestingInstitutions()
  const { data: profile } = useProfile()

  const sortBy = getSortBy(sortingState)
  const sortDirection = getSortDirection(sortingState)

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSortingState((current) =>
      typeof updater === 'function' ? updater(current) : updater,
    )
    setPage(1)
  }

  const { data: response, isLoading } = useQuery({
    queryKey: ['requesting-institutions', page, size, sortBy, sortDirection],
    queryFn: () =>
      getRequestingInstitutions({
        page,
        size,
        sortBy,
        sortDirection,
      }),
  })

  const data = response?.data

  const columns: ColumnDef<RequestingInstitution>[] = [
    {
      accessorKey: 'name',
      header: 'Demandante',
      enableSorting: true,
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      enableSorting: true,
    },
    {
      accessorKey: 'agency',
      header: 'Órgão',
      enableSorting: true,
    },
    {
      id: 'jurisdiction_level',
      accessorKey: 'jurisdictionLevel',
      header: 'Competência',
      cell: ({ row }) => jurisdictionLabels[row.original.jurisdictionLevel],
      enableSorting: true,
    },
    {
      id: 'created_at',
      accessorKey: 'createdAt',
      header: 'Criada em',
      enableSorting: true,
      cell: ({ row }) =>
        row.original.createdAt
          ? formatDate(row.original.createdAt, 'dd/MM/yyyy HH:mm')
          : '—',
    },
    {
      id: 'actions',
      enableSorting: false,
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
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
