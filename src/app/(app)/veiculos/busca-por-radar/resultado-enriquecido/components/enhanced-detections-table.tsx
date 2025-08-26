import type { ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Label } from '@/components/ui/label'
import type { EnhancedDetectionDTO } from '@/hooks/use-queries/use-enhanced-radars-search'

interface DetectionsTableProps {
  data: EnhancedDetectionDTO[]
  isLoading: boolean
}

export function EnhancedDetectionsTable({
  data,
  isLoading,
}: DetectionsTableProps) {
  const router = useRouter()

  const columns: ColumnDef<EnhancedDetectionDTO>[] = [
    {
      accessorKey: 'timestamp',
      header: () => <Label>Data e Hora</Label>,
      cell: ({ row }) => (
        <span>
          {formatDate(row.getValue('timestamp'), 'dd/MM/y HH:mm:ss', {
            locale: ptBR,
          })}
        </span>
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
      accessorKey: 'cetRioCode',
      header: () => <Label className="w-28">Radar</Label>,
      cell: ({ row }) => (
        <span>
          {row.getValue('plate') === '' ? '--------' : row.getValue('plate')}
        </span>
      ),
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
