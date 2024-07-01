'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ColumnDef } from '@tanstack/react-table'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import {
  type AdditionalInfo,
  getMonitoredPlates,
  type GetMonitoredPlatesResponse,
  type MonitoredPlate,
} from '@/http/cars/get-monitored-plates'
import { getProfile } from '@/http/user/get-profile'
import { genericErrorMessage } from '@/utils/error-handlers'

import { getColumns } from './columns'
import {
  type NewPlateForm,
  newPlateFormSchema,
} from './create-monitored-plate-dialog'

const CreateMonitoredPlateDialog = dynamic(
  () =>
    import('./create-monitored-plate-dialog').then(
      (mod) => mod.CreateMonitoredPlateDialog,
    ),
  {
    ssr: false, // Disable server-side rendering
  },
)

export default function MonitoredPlates() {
  const [data, setData] = useState<GetMonitoredPlatesResponse>()
  const [columns, setColumns] = useState<ColumnDef<MonitoredPlate>[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [operations, setOperations] = useState<string[]>([])

  const createMonitoredPlateFormMethods = useForm<NewPlateForm>({
    resolver: zodResolver(newPlateFormSchema),
    defaultValues: {
      operation: '',
    },
  })

  const { reset } = createMonitoredPlateFormMethods

  useEffect(() => {
    async function getData() {
      try {
        const { data } = await getProfile()
        setIsAdmin(data.is_admin)
        const _columns = getColumns({ isAdmin: data.is_admin })
        setColumns(_columns)

        const response = await getMonitoredPlates({})
        setData(response.data)

        const tempOperations = response.data.items.map((item) => {
          const info = item.additional_info as AdditionalInfo
          const operation = info.Operação

          return String(operation)
        })

        setOperations([...new Set(tempOperations)]) // Remove duplicatas
      } catch (error) {
        toast.error(genericErrorMessage)
        console.error({ error })
        return null
      }
    }

    getData()
  }, [])

  function onOpenCreateDialogChange(open: boolean) {
    setOpenCreateDialog(open)
    reset()
  }

  return (
    <div className="page-content flex flex-col gap-8 pt-8">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          Placas monitoradas
        </h1>
        <Dialog open={openCreateDialog} onOpenChange={onOpenCreateDialogChange}>
          <DialogTrigger asChild>
            {isAdmin ? (
              <Button>Adicionar</Button>
            ) : (
              // <Tooltip text="Você não tem permissão para executar essa ação.">
              <Button disabled={true}>Adicionar</Button>
              // </Tooltip>
            )}
          </DialogTrigger>
          {operations && (
            <FormProvider {...createMonitoredPlateFormMethods}>
              <CreateMonitoredPlateDialog operations={operations} />
            </FormProvider>
          )}
        </Dialog>
      </div>
      {data && <DataTable columns={columns} data={data.items} />}
    </div>
  )
}
