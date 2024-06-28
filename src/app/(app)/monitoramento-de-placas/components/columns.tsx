'use client'

import { ColumnDef } from '@tanstack/react-table'
import { PencilLine, Trash } from 'lucide-react'
import dynamic from 'next/dynamic'

import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import type { MonitoredPlate } from '@/http/cars/get-monitored-plates'

import { DeleteMonitoredPlateAlertDialog } from './delete-monitored-plate-alert-dialog'

const UpdateMonitoredPlateDialog = dynamic(
  () =>
    import('./update-monitored-plate-dialog').then(
      (mod) => mod.UpdateMonitoredPlateDialog,
    ),
  {
    ssr: false, // Disable server-side rendering
  },
)

interface GetColumnsProps {
  isAdmin: boolean
}
export function getColumns({ isAdmin }: GetColumnsProps) {
  console.log(isAdmin)
  const columns: ColumnDef<MonitoredPlate>[] = [
    {
      accessorKey: 'plate',
      header: 'Placa',
    },
    {
      accessorKey: 'additional_info',
      header: 'Informações adicionais',
      cell: ({ row }) => {
        return (
          <div>{JSON.stringify(row.getValue('additional_info') || '')}</div>
        )
      },
    },
    {
      id: 'edit',
      cell: ({ row }) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={!isAdmin}>
              <span className="sr-only">Editar linha</span>
              <PencilLine className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <UpdateMonitoredPlateDialog
            plate={row.original.plate}
            additionalInfo={row.original.additional_info}
            notificationChannels={row.original.notification_channels}
          />
        </Dialog>
      ),
    },
    {
      id: 'delete',
      cell: ({ row }) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={!isAdmin}>
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

  return columns
}
