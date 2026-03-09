'use client'

import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Eye } from 'lucide-react'
import Link from 'next/link'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { useTicketsSearchParams } from '@/hooks/useParams/useTicketsSearchParams'
import { getTickets, type TicketListItem } from '@/http/tickets/get-tickets'

function mapPriority(p: TicketListItem['prioridade']) {
  if (p === 'URGENTE') return 'Urgente'
  if (p === 'ALTA') return 'Alta'
  return 'Rotina'
}
function mapNature(n: TicketListItem['natureza']) {
  if (!n) return '-'
  const dict: Record<string, string> = {
    CIVIL: 'Civil',
    CRIMINAL: 'Criminal',
    TRABALHISTA: 'Trabalhista',
    ADMINISTRATIVO: 'Administrativo',
    OUTROS: 'Outros',
  }
  return dict[n] ?? n
}

export function TicketsTable() {
  const { formattedSearchParams, queryKey, handlePaginate } =
    useTicketsSearchParams()

  const { data: response, isLoading } = useQuery({
    queryKey,
    queryFn: () => getTickets(formattedSearchParams),
  })

  const data = response?.data

  const columns: ColumnDef<TicketListItem>[] = [
    {
      accessorKey: 'criado_em',
      header: 'Criado em',
      cell: ({ row }) =>
        format(new Date(row.original.criado_em), 'dd/MM/yyyy HH:mm'),
    },
    { accessorKey: 'numero_procedimento', header: 'Nº procedimento' },
    { accessorKey: 'numero_oficio', header: 'Nº ofício' },
    {
      accessorKey: 'prioridade',
      header: 'Prioridade',
      cell: ({ row }) => mapPriority(row.original.prioridade),
    },
    {
      accessorKey: 'natureza',
      header: 'Natureza',
      cell: ({ row }) => mapNature(row.original.natureza),
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
          <Tooltip text="Ver" asChild>
            <Button
              asChild
              variant="ghost"
              className="h-8 w-8 p-0"
              type="button"
            >
              <Link href={`/chamados/${row.original.id}`}>
                <span className="sr-only">Ver chamado</span>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-8">
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
