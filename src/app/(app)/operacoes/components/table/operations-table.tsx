'use client'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { PencilLine, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useOperationsSearchParams } from '@/hooks/params/use-operations-search-params'
import { useOperations } from '@/hooks/use-operations'
import { getOperations } from '@/http/operations/get-operations'
import type { Operation } from '@/models/entities'

export function OperationsTable() {
  const { formattedSearchParams, queryKey, handlePaginate } =
    useOperationsSearchParams()
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteOperationProps,
    deleteAlertDisclosure,
  } = useOperations()

  const { data: response, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      getOperations({
        ...formattedSearchParams,
      }),
  })

  const data = response?.data

  const columns: ColumnDef<Operation>[] = [
    {
      accessorKey: 'title',
      header: 'Nome',
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
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
                setOnDeleteOperationProps({
                  id: row.original.id,
                  title: row.original.title,
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
