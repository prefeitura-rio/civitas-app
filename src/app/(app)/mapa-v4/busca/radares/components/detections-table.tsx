import type { ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Label } from '@/components/ui/label'
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import type { RadarDetection, Vehicle } from '@/models/entities'

interface DetectionsTableProps {
  data: (RadarDetection & Vehicle)[]
  isLoading: boolean
}

export function DetectionsTable({ data, isLoading }: DetectionsTableProps) {
  const router = useRouter()
  const { searchParams } = useCarRadarSearchParams()

  const columns: ColumnDef<RadarDetection & Vehicle>[] = [
    {
      accessorKey: 'timestamp',
      header: () => <Label>Data e Hora</Label>,
      cell: ({ row }) => (
        <span>{formatDate(row.getValue('timestamp'), 'dd/MM/y HH:mm:ss')}</span>
      ),
    },
    {
      accessorKey: 'plate',
      header: () => <Label className="w-28">Placa</Label>,
      cell: ({ row }) => <span>{row.getValue('plate')}</span>,
    },
    {
      accessorKey: 'brandModel',
      header: () => <Label className="w-28">Marca/Modelo</Label>,
      cell: ({ row }) => <span>{row.getValue('brandModel')}</span>,
    },
    {
      accessorKey: 'color',
      header: () => <Label className="w-28">Cor</Label>,
      cell: ({ row }) => <span>{row.getValue('color')}</span>,
    },
    {
      accessorKey: 'modelYear',
      header: () => <Label className="w-28">Ano Modelo</Label>,
      cell: ({ row }) => <span>{row.getValue('modelYear')}</span>,
    },
    {
      accessorKey: 'speed',
      header: () => <Label className="text-right">Velocidade</Label>,
      cell: ({ row }) => <span>{row.getValue('speed')}</span>,
    },
    {
      id: 'actions',
      header: () => <Label></Label>,
      cell: () => (
        <Tooltip asChild text="Ver mais detalhes do veículo">
          <Button
            variant="outline"
            className="size-6 shrink-0 p-0"
            onClick={() =>
              router.push(`/mapa-v4/busca/veiculo?${searchParams.toString()}`)
            }
          >
            <ArrowUpRight className="size-4" />
          </Button>
        </Tooltip>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
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
