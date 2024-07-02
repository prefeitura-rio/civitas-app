'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Trash } from 'lucide-react'
import dynamic from 'next/dynamic'

import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type {
  AdditionalInfo,
  MonitoredPlate,
} from '@/http/cars/get-monitored-plates'

const DeleteMonitoredPlateAlertDialog = dynamic(
  () =>
    import('./delete-monitored-plate-alert-dialog').then(
      (mod) => mod.DeleteMonitoredPlateAlertDialog,
    ),
  {
    ssr: false, // Disable server-side rendering
  },
)

interface GetColumnsProps {
  isAdmin: boolean
}
export function getColumns({ isAdmin }: GetColumnsProps) {
  const columns: ColumnDef<MonitoredPlate>[] = [
    {
      accessorKey: 'plate',
      header: 'Placa',
    },
    {
      accessorKey: 'additional_info',
      header: 'Operação',
      cell: ({ row }) => {
        const additionalInfo: AdditionalInfo = row.getValue('additional_info')
        return <div>{additionalInfo.Operação}</div>
      },
    },
    // {
    //   id: 'edit',
    //   cell: ({ row }) => (
    //     <Dialog>
    //       <DialogTrigger asChild>
    //         <Button variant="ghost" className="h-8 w-8 p-0" disabled={!isAdmin}>
    //           <span className="sr-only">Editar linha</span>
    //           <PencilLine className="h-4 w-4" />
    //         </Button>
    //       </DialogTrigger>
    //       <UpdateMonitoredPlateDialog
    //         plate={row.original.plate}
    //         additionalInfo={row.original.additional_info}
    //         notificationChannels={row.original.notification_channels}
    //       />
    //     </Dialog>
    //   ),
    // },
    {
      id: 'delete',
      header: () => <div className="text-right">Ações</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="h-8 w-8 p-0"
                disabled={!isAdmin}
              >
                <span className="sr-only">Excluir linha</span>
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <DeleteMonitoredPlateAlertDialog plate={row.original.plate} />
          </AlertDialog>
        </div>
      ),
    },
  ]

  return columns
}
