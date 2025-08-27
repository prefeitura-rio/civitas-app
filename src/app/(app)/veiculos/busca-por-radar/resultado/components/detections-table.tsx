import type { ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Label } from '@/components/ui/label'
import type { DetectionDTO } from '@/hooks/use-queries/use-radars-search'
import { dateConfig } from '@/lib/date-config'

interface DetectionsTableProps {
  data: DetectionDTO[]
  isLoading: boolean
}

export function DetectionsTable({ data, isLoading }: DetectionsTableProps) {
  const router = useRouter()

  const columns: ColumnDef<DetectionDTO>[] = [
    {
      accessorKey: 'timestamp',
      header: () => <Label>Data e Hora</Label>,
      cell: ({ row }) => (
        <span>
          {formatDate(row.getValue('timestamp'), 'dd/MM/y HH:mm:ss', {
            locale: dateConfig.locale,
          })}
        </span>
      ),
    },
    {
      accessorKey: 'plate',
      header: () => <Label className="w-28">Placa</Label>,
      cell: ({ row }) => (
        <span>
          {row.getValue('plate') === '' ? '--------' : row.getValue('plate')}
        </span>
      ),
    },
    {
      accessorKey: 'cetRioCode',
      header: () => <Label className="w-28">Radar</Label>,
      cell: ({ row }) => <span>{row.getValue('cetRioCode')}</span>,
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
      cell: ({ row }) => (
        <Tooltip asChild text="Ver mais detalhes do veículo">
          <Button
            variant="outline"
            className="size-6 shrink-0 p-0"
            onClick={() =>
              router.push(
                `/veiculos/busca-por-radar/veiculo?plate=${row.getValue('plate')}`,
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
