'use client'

import { ColumnDef } from '@tanstack/react-table'
import { PencilLine, Trash } from 'lucide-react'
import dynamic from 'next/dynamic'

import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import type { MonitoredPlate } from '@/models/operation'

import { CreateMonitoredPlateDialog } from './create-monitored-plate-dialog'

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
  rows: MonitoredPlate[]
}

export function MonitoredPlatesTable({ isAdmin, rows }: GetColumnsProps) {
  const columns: ColumnDef<MonitoredPlate>[] = [
    {
      accessorKey: 'plate',
      header: 'Placa',
      enableColumnFilter: true,
    },
    {
      accessorKey: 'operation',
      header: 'Operação',
      cell: ({ row }) => {
        const operationTitle = row.original.operation?.title || ''
        return <div>{operationTitle}</div>
      },
      enableColumnFilter: true,
    },
    {
      id: 'actions',
      maxSize: 1,
      header: () => (
        <div className="flex justify-end">
          <p className="w-[4.5rem] text-center">Ações</p>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={!isAdmin}
                >
                  <span className="sr-only">Editar linha</span>
                  <PencilLine className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <CreateMonitoredPlateDialog />
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
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
        </div>
      ),
    },
  ]

  return <DataTable columns={columns} data={rows} />
}
