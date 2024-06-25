'use client'

import { ColumnDef } from '@tanstack/react-table'
import { PencilLine, Trash } from 'lucide-react'

import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import { DeleteMonitoredPlateAlertDialog } from './delete-monitored-plate-alert-dialog'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type MonitoredPlate = {
  id: string
  plate: string
  additional_info: any
}

export type MonitoredPlateResponse = {
  items: MonitoredPlate[]
  total: number
  page: number
  size: number
  pages: number
}

export const columns: ColumnDef<MonitoredPlate>[] = [
  {
    accessorKey: 'plate',
    header: 'Placa',
  },
  {
    accessorKey: 'additional_info',
    header: 'Informações adicionais',
    cell: ({ row }) => {
      return <div>{String(row.getValue('additional_info') || '')}</div>
    },
  },
  {
    id: 'edit',
    cell: ({ row }) => (
      <Button variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">Editar linha</span>
        <PencilLine className="h-4 w-4" />
      </Button>
    ),
  },
  {
    id: 'delete',
    cell: ({ row }) => (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Excluir linha</span>
            <Trash className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <DeleteMonitoredPlateAlertDialog
          id={row.original.id}
          plate={row.original.plate}
        />
      </AlertDialog>
    ),
  },
]
