'use client'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { PencilLine, Trash } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useInstitutionAuthorities } from '@/hooks/useContexts/use-institution-authorities-context'
import { useProfile } from '@/hooks/useQueries/useProfile'
import {
  getInstitutionAuthorities,
  type InstitutionAuthority,
} from '@/http/institution-authorities'
import { getRequestingInstitutions } from '@/http/requesting-institutions'
import { notAllowed } from '@/utils/template-messages'

function getContactsSummary(authority: InstitutionAuthority) {
  const phoneCount = authority.contacts?.phones.length ?? 0
  const emailCount = authority.contacts?.emails.length ?? 0

  if (phoneCount === 0 && emailCount === 0) return '—'

  const parts = []
  if (phoneCount > 0) {
    parts.push(`${phoneCount} telefone${phoneCount > 1 ? 's' : ''}`)
  }
  if (emailCount > 0) {
    parts.push(`${emailCount} e-mail${emailCount > 1 ? 's' : ''}`)
  }

  return parts.join(' • ')
}

export function InstitutionAuthoritiesTable() {
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const {
    formDialogDisclosure,
    setDialogInitialData,
    setOnDeleteInstitutionAuthorityProps,
    deleteAlertDisclosure,
  } = useInstitutionAuthorities()
  const { data: profile } = useProfile()

  const { data: response, isLoading } = useQuery({
    queryKey: ['institution-authorities', page, size],
    queryFn: () => getInstitutionAuthorities({ page, size }),
  })

  const { data: requestingInstitutionsResponse } = useQuery({
    queryKey: ['requesting-institutions', 'options', 100],
    queryFn: () => getRequestingInstitutions({ page: 1, size: 100 }),
  })

  const requestingInstitutionsById = useMemo(
    () =>
      new Map(
        (requestingInstitutionsResponse?.data.items ?? []).map((item) => [
          item.id,
          item.name,
        ]),
      ),
    [requestingInstitutionsResponse?.data.items],
  )

  const data = response?.data

  const columns: ColumnDef<InstitutionAuthority>[] = [
    {
      accessorKey: 'name',
      header: 'Requisitante',
    },
    {
      id: 'requestingInstitution',
      header: 'Demandante',
      cell: ({ row }) =>
        requestingInstitutionsById.get(row.original.requestingInstitutionId) ??
        '—',
    },
    {
      accessorKey: 'isFocalPoint',
      header: 'Ponto focal',
      cell: ({ row }) => (row.original.isFocalPoint ? 'Sim' : 'Não'),
    },
    {
      id: 'contacts',
      header: 'Contatos',
      cell: ({ row }) => getContactsSummary(row.original),
    },
    {
      accessorKey: 'createdAt',
      header: 'Criado em',
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
                  setOnDeleteInstitutionAuthorityProps({
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
