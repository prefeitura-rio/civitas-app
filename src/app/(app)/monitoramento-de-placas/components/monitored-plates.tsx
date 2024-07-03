'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { getMonitoredPlates } from '@/http/cars/monitored/get-monitored-plates'
import { getProfile } from '@/http/user/get-profile'

import {
  type NewPlateForm,
  newPlateFormSchema,
} from './monitored-plates/create-monitored-plate-dialog'
import { MonitoredPlatesTable } from './monitored-plates/monitored-plates-table'

const CreateMonitoredPlateDialog = dynamic(
  () =>
    import('./monitored-plates/create-monitored-plate-dialog').then(
      (mod) => mod.CreateMonitoredPlateDialog,
    ),
  {
    ssr: false, // Disable server-side rendering
  },
)

export default function MonitoredPlates() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)

  const { data: monitoredPlatesResponse, isLoading: isLoadingPlates } =
    useQuery({
      queryKey: ['cars/monitored'],
      queryFn: () => getMonitoredPlates({}),
    })

  const { data: profileResponse, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile(),
  })

  const createMonitoredPlateFormMethods = useForm<NewPlateForm>({
    resolver: zodResolver(newPlateFormSchema),
    defaultValues: {
      operation: '',
    },
  })

  const { reset } = createMonitoredPlateFormMethods

  useEffect(() => {
    if (!isLoadingPlates && !isLoadingProfile) {
      setIsAdmin(profileResponse?.data.is_admin || false)
      // setData(monitoredPlatesResponse?.data)
    }
  }, [
    profileResponse,
    monitoredPlatesResponse,
    isLoadingPlates,
    isLoadingProfile,
  ])

  function onOpenCreateDialogChange(open: boolean) {
    setOpenCreateDialog(open)
    reset()
  }

  return (
    <div className="page-content flex flex-col gap-8">
      <FormProvider {...createMonitoredPlateFormMethods}>
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">
            Placas monitoradas
          </h1>
          <Dialog
            open={openCreateDialog}
            onOpenChange={onOpenCreateDialogChange}
          >
            <DialogTrigger asChild>
              {isAdmin ? (
                <Button>Adicionar</Button>
              ) : (
                // <Tooltip text="Você não tem permissão para executar essa ação.">
                <Button disabled={true}>Adicionar</Button>
                // </Tooltip>
              )}
            </DialogTrigger>
            <CreateMonitoredPlateDialog />
          </Dialog>
        </div>
        {monitoredPlatesResponse && (
          <MonitoredPlatesTable
            isAdmin={isAdmin}
            rows={monitoredPlatesResponse.data.items}
          />
        )}
      </FormProvider>
    </div>
  )
}
