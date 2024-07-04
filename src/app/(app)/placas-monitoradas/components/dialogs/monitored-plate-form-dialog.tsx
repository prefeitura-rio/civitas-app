'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InputError } from '@/components/ui/input-error'
import { Label } from '@/components/ui/label'
import { SelectWithSearch } from '@/components/ui/select-with-search'
// import { SelectWithSearch } from '@/components/ui/select-with-search'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import {
  type MonitoredPlateForm,
  monitoredPlateFormSchema,
} from '@/contexts/monitored-plates-context'
import { useMonitoredPlates } from '@/hooks/use-monitored-plates'
import { createMonitoredPlate } from '@/http/cars/monitored/create-monitored-plate'
import { getMonitoredPlate } from '@/http/cars/monitored/get-monitored-plate'
import { updateMonitoredPlate } from '@/http/cars/monitored/update-monitored-plate'
import { getOperations } from '@/http/operations/get-operations'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

interface MonitoredPlateDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function MonitoredPlateFormDialog({
  isOpen,
  onClose,
  onOpen,
}: MonitoredPlateDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    dialogInitialData: initialData,
    setDialogInitialData: setInitialData,
  } = useMonitoredPlates()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MonitoredPlateForm>({
    resolver: zodResolver(monitoredPlateFormSchema),
  })

  const {
    mutateAsync: createMonitoredPlateMutation,
    isPending: isPendingCreate,
  } = useMutation({
    mutationFn: createMonitoredPlate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cars/monitored'],
      })
    },
    onError: () => {
      toast.error(genericErrorMessage)
    },
  })

  const {
    mutateAsync: updateMonitoredPlateMutation,
    isPending: isPendingUpdate,
  } = useMutation({
    mutationFn: updateMonitoredPlate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cars/monitored'],
      })
    },
    onError: () => {
      toast.error(genericErrorMessage)
    },
  })

  const { data: monitoredPlatesResponse, isLoading: isLoadingMonitoredPlates } =
    useQuery({
      queryKey: [`cars/monitored/${initialData?.id}`],
      queryFn: () =>
        initialData ? getMonitoredPlate({ plate: initialData?.id }) : null,
    })

  const { data: operationsResponse } = useQuery({
    queryKey: ['operations'],
    queryFn: () => getOperations({ size: 100 }),
  })

  const operations = operationsResponse?.data.items || []
  console.log({ operations })
  function handleOnOpenChange(open: boolean) {
    if (open) {
      onOpen()
    } else {
      onClose()
      reset()
      setInitialData(null)
    }
  }

  async function onSubmit(props: MonitoredPlateForm) {
    if (initialData?.id) {
      await updateMonitoredPlateMutation({
        plate: props.plate,
        active: props.active,
        notes: props.notes,
        operationId: props.operation.id,
        // additionalInfo: props.additionalInfo,
        notificationChannels: props.notificationChannels,
      })
    } else {
      const response = createMonitoredPlateMutation({
        plate: props.plate,
        operationId: props.operation.id,
        notificationChannels: props.notificationChannels,
        active: true,
        // additionalInfo: props.additionalInfo,
        notes: props.notes,
      })
      toast.promise(response, {
        loading: `Adicionando placa ${props?.plate}...`,
        success: (data) => {
          return `Placa ${data.data.plate} adicionada com sucesso!`
        },
        error: genericErrorMessage,
      })
      await response
    }
    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (initialData && isOpen && !isLoading && monitoredPlatesResponse) {
      setValue('plate', monitoredPlatesResponse.data.plate)
      setValue('active', monitoredPlatesResponse.data.active)
      setValue('additionalInfo', monitoredPlatesResponse.data.additionalInfo)
      setValue('notes', monitoredPlatesResponse.data.notes)
      setValue('operation.id', monitoredPlatesResponse.data.operation.id)
      setValue('operation.title', monitoredPlatesResponse.data.operation.title)
      if (monitoredPlatesResponse.data.notificationChannels.length > 0) {
        setValue('notificationChannels', [
          monitoredPlatesResponse.data.notificationChannels[0],
          ...monitoredPlatesResponse.data.notificationChannels,
        ])
      }
      setIsLoading(false)
    }
  }, [isOpen, isLoading, monitoredPlatesResponse])

  useEffect(() => {
    if (
      isLoadingMonitoredPlates ||
      isSubmitting ||
      isPendingCreate ||
      isPendingUpdate
    ) {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [isSubmitting, isPendingCreate, isPendingUpdate, isLoadingMonitoredPlates])

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Operação</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="plate">Placa</Label>
              <InputError message={errors.plate?.message} />
            </div>
            <Input
              id="plate"
              {...register('plate')}
              type="text"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="notes">Observações</Label>
              <InputError message={errors.notes?.message} />
            </div>
            <Textarea id="notes" {...register('notes')} disabled={isLoading} />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label>Operação</Label>
              <InputError message={errors.operation?.title?.message} />
            </div>
            <Controller
              control={control}
              name="operation.title"
              render={({ field }) => (
                <SelectWithSearch
                  onSelect={(item) => {
                    setValue('operation.title', item.label)
                    setValue('operation.id', item.value)
                  }}
                  options={operations.map((item) => {
                    return {
                      label: item.title,
                      value: item.id,
                    }
                  })}
                  value={field.value}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label>Canal de notificação</Label>
              <InputError message={errors.operation?.title?.message} />
            </div>
            <Controller
              control={control}
              name="operation.title"
              render={({ field }) => (
                <SelectWithSearch
                  onSelect={(item) => {
                    setValue('operation.title', item.label)
                    setValue('operation.id', item.value)
                  }}
                  options={operations.map((item) => {
                    return {
                      label: item.title,
                      value: item.id,
                    }
                  })}
                  value={field.value}
                />
              )}
            />
          </div>

          <div className="mt-4 flex w-full justify-end">
            <Button type="submit" disabled={isLoading}>
              {isPendingCreate || isPendingUpdate ? (
                <Spinner />
              ) : (
                <span>Adicionar</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
