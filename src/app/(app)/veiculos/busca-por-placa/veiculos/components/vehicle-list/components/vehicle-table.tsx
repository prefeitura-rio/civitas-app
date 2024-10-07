import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Label } from '@/components/ui/label'
import { useCarPathsSearchParams } from '@/hooks/use-params/use-car-paths-search-params'
import type { Vehicle } from '@/models/entities'
import { toQueryParams } from '@/utils/to-query-params'

interface DetectionsTableProps {
  data: Vehicle[] | undefined
  isLoading: boolean
}

export function VehicleTable({ data, isLoading }: DetectionsTableProps) {
  const router = useRouter()
  const { formattedSearchParams } = useCarPathsSearchParams()

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: 'placa',
      header: () => <Label className="w-28">Placa</Label>,
      cell: ({ row }) => <span>{row.getValue('placa')}</span>,
    },
    {
      accessorKey: 'marcaModelo',
      header: () => <Label className="w-28">Marca/Modelo</Label>,
      cell: ({ row }) => <span>{row.getValue('marcaModelo')}</span>,
    },
    {
      accessorKey: 'cor',
      header: () => <Label className="w-28">Cor</Label>,
      cell: ({ row }) => <span>{row.getValue('cor')}</span>,
    },
    {
      accessorKey: 'anoModelo',
      header: () => <Label className="w-28">Ano Modelo</Label>,
      cell: ({ row }) => <span>{row.getValue('anoModelo')}</span>,
    },
    {
      id: 'actions',
      header: () => <Label></Label>,
      cell: ({ row }) => {
        const params = {
          plate: row.getValue('placa'),
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
                router.push(
                  `/veiculos/busca-por-placa/veiculo?${query.toString()}`,
                )
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
      filters={[
        {
          accessorKey: 'brandModel',
          placeholder: 'Filtrar por marca/modelo',
        },
        {
          accessorKey: 'color',
          placeholder: 'Filtrar por cor',
        },
      ]}
    />
  )
}
