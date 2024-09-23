import type { ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Label } from '@/components/ui/label'
import { useCarRadarSearchParams } from '@/hooks/use-params/use-car-radar-search-params.'
import type { DetectionDTO } from '@/hooks/use-queries/use-radars-search'

interface DetectionsTableProps {
  data: DetectionDTO[]
  isLoading: boolean
}

export function DetectionsTable({ data, isLoading }: DetectionsTableProps) {
  const router = useRouter()
  const { searchParams } = useCarRadarSearchParams()

  const columns: ColumnDef<DetectionDTO>[] = [
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
      accessorKey: 'cameraNumber',
      header: () => <Label className="w-28">Radar</Label>,
      cell: ({ row }) => <span>{row.getValue('cameraNumber')}</span>,
    },
    {
      accessorKey: 'location',
      header: () => <Label className="w-28">Localização</Label>,
      cell: ({ row }) => <span>{row.getValue('location')}</span>,
    },
    {
      accessorKey: 'lane',
      header: () => <Label className="w-28">Faixa</Label>,
      cell: ({ row }) => <span>{row.getValue('lane')}</span>,
    },
    {
      accessorKey: 'speed',
      header: () => <Label className="text-right">Velocidade [Km/h]</Label>,
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
              router.push(
                `/mapa/busca-por-placa/veiculo?${searchParams.toString()}`,
              )
            }
          >
            <ArrowUpRight className="size-4" />
          </Button>
        </Tooltip>
      ),
    },
  ]

  return (
    <DataTable columns={columns} data={data} isLoading={isLoading} pagination />
  )
}
