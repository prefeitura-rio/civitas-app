import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Label } from '@/components/ui/label'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'
import { toQueryParams } from '@/utils/to-query-params'

type PlateRow = {
  plate: string
}

interface DetectionsTableProps {
  data: PlateRow[] | undefined
  isLoading: boolean
}

export function PlatesTable({ data, isLoading }: DetectionsTableProps) {
  const router = useRouter()
  const { formattedSearchParams } = useCarPathsSearchParams()

  const columns: ColumnDef<PlateRow>[] = [
    {
      accessorKey: 'plate',
      header: () => <Label className="w-28">Placa</Label>,
      cell: ({ row }) => <span>{row.getValue('plate')}</span>,
    },
    {
      id: 'actions',
      header: () => <Label></Label>,
      cell: ({ row }) => {
        const params = {
          plate: row.getValue('plate'),
          from: formattedSearchParams?.from,
          to: formattedSearchParams?.to,
        }
        const query = toQueryParams(params)
        return (
          <Tooltip asChild text="Ver mais detalhes do veículo">
            <Button
              variant="outline"
              className="size-6 shrink-0 p-0"
              onClick={() =>
                router.push(`/veiculos/busca-por-placa/veiculo?${query.toString()}`)
              }
            >
              <ArrowUpRight className="size-4" />
            </Button>
          </Tooltip>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data || []}
      isLoading={isLoading}
      pagination
    />
  )
}
