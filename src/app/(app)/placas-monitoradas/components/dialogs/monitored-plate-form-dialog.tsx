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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InputError } from '@/components/ui/input-error'
import { Label } from '@/components/ui/label'
import MultipleSelector from '@/components/ui/multiselect-with-search'
import { SelectWithSearch } from '@/components/ui/select-with-search'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  type MonitoredPlateForm,
  monitoredPlateFormSchema,
} from '@/contexts/monitored-plates-context'
import { useMonitoredPlates } from '@/hooks/use-monitored-plates'
import { createMonitoredPlate } from '@/http/cars/monitored/create-monitored-plate'
import { getMonitoredPlate } from '@/http/cars/monitored/get-monitored-plate'
import { updateMonitoredPlate } from '@/http/cars/monitored/update-monitored-plate'
import { getNotificationChannels } from '@/http/notification-channels/get-notification-channels'
import { getOperations } from '@/http/operations/get-operations'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage, isConflictError } from '@/utils/error-handlers'

interface MonitoredPlateDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  shouldFetchData?: boolean
}

export function MonitoredPlateFormDialog({
  isOpen,
  onClose,
  onOpen,
  shouldFetchData = true,
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
    defaultValues: {
      active: true,
      notes: '',
      operation: {
        id: '',
        title: '',
      },
    },
  })

  const {
    mutateAsync: createMonitoredPlateMutation,
    isPending: isPendingCreate,
  } = useMutation({
    mutationFn: createMonitoredPlate,
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: ['cars/monitored'],
      })
      queryClient.invalidateQueries({
        queryKey: [`cars/monitored/${data.plate}`],
      })
      toast.success(`A placa ${data.plate} foi cadastrada com sucesso!`)
    },
    onError: (error, variables) => {
      if (isConflictError(error)) {
        toast.error(`A placa ${variables.plate} já existe`)
      } else {
        toast.error(genericErrorMessage)
      }
    },
  })

  const {
    mutateAsync: updateMonitoredPlateMutation,
    isPending: isPendingUpdate,
  } = useMutation({
    mutationFn: updateMonitoredPlate,
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: [`cars/monitored/${data.plate}`],
      })
      queryClient.invalidateQueries({
        queryKey: ['cars/monitored'],
      })
      toast.success(`A placa ${data.plate} foi atualizada com sucesso!`)
    },
    onError: (error, variables) => {
      if (isConflictError(error)) {
        toast.error(`A placa ${variables.plate} já existe`)
      } else {
        toast.error(genericErrorMessage)
      }
    },
  })

  const { data: monitoredPlateResponse, isLoading: isLoadingMonitoredPlate } =
    useQuery({
      queryKey: [`cars/monitored/${initialData?.plate}`],
      queryFn: () =>
        initialData && shouldFetchData
          ? getMonitoredPlate({ plate: initialData.plate })
          : null,
    })

  const { data: operationsResponse } = useQuery({
    queryKey: ['operations'],
    queryFn: () => getOperations({ size: 100 }),
  })
  const { data: NotificationChannelResponse } = useQuery({
    queryKey: ['notification-channels'],
    queryFn: () => getNotificationChannels({ size: 100 }),
  })

  const operations = operationsResponse?.data.items || []
  function handleOnOpenChange(open: boolean) {
    if (open) {
      onOpen()
    } else {
      onClose()
      reset()
      setInitialData(null)
      setValue('notificationChannels', [])
      setValue('operation.id', '')
      setValue('operation.title', '')
    }
  }

  async function onSubmit(props: MonitoredPlateForm) {
    const notificationChannels = props.notificationChannels.map(
      (item) => item.value,
    )
    if (initialData?.plate && shouldFetchData) {
      await updateMonitoredPlateMutation({
        plate: props.plate,
        active: props.active,
        notes: props.notes,
        operationId: props.operation.id,
        notificationChannels,
        // additionalInfo: props.additionalInfo,
      })
    } else {
      await createMonitoredPlateMutation({
        plate: props.plate,
        active: true,
        operationId: props.operation.id,
        notes: props.notes,
        notificationChannels,
        // additionalInfo: props.additionalInfo,
      })
    }
    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (
      initialData &&
      isOpen &&
      !isLoading &&
      monitoredPlateResponse &&
      shouldFetchData
    ) {
      setValue('plate', monitoredPlateResponse.data.plate)
      setValue('active', monitoredPlateResponse.data.active)
      setValue('additionalInfo', monitoredPlateResponse.data.additionalInfo)
      setValue('notes', monitoredPlateResponse.data.notes)
      setValue('operation.id', monitoredPlateResponse.data.operation.id || '')
      setValue(
        'operation.title',
        monitoredPlateResponse.data.operation.title || '',
      )
      if (monitoredPlateResponse.data.notificationChannels.length > 0) {
        const channelOptions =
          monitoredPlateResponse.data.notificationChannels.map((item) => {
            return {
              label: item.title,
              value: item.id,
            }
          })
        setValue('notificationChannels', channelOptions)
      }
      setIsLoading(false)
    }

    if (initialData && isOpen && !shouldFetchData) {
      setValue('plate', initialData.plate)
    }
  }, [isOpen, isLoading, monitoredPlateResponse])

  useEffect(() => {
    if (
      isLoadingMonitoredPlate ||
      isSubmitting ||
      isPendingCreate ||
      isPendingUpdate
    ) {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [isSubmitting, isPendingCreate, isPendingUpdate, isLoadingMonitoredPlate])

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData && shouldFetchData
              ? 'Atualizar placa monitorada'
              : 'Monitorar nova placa'}
          </DialogTitle>
          <DialogDescription>
            {initialData && shouldFetchData
              ? 'Gerencie o monitoramento dessa placa.'
              : 'Cadastre uma nova placa a ser monitorada.'}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="plate">Placa</Label>
              <InputError message={errors.plate?.message} />
            </div>
            <Input
              id="plate"
              {...register('plate')}
              type="text"
              disabled={isLoading || !!initialData}
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
                  disabled={isLoading}
                  value={field.value}
                  placeholder="Selecione uma operação"
                  // emptyIndicator={<p>Nenhum resoltado encontrado.</p>}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label>Canal de notificação</Label>
              <InputError message={errors.notificationChannels?.message} />
            </div>
            <Controller
              control={control}
              name="notificationChannels"
              render={({ field }) => (
                <MultipleSelector
                  {...field}
                  defaultOptions={(
                    NotificationChannelResponse?.data.items || []
                  ).map((item) => {
                    return {
                      label: item.title,
                      value: item.id,
                    }
                  })}
                  disabled={isLoading}
                  placeholder="Selecione um canal"
                  emptyIndicator={<p>Nenhum resultado encontrado.</p>}
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name="active"
            render={({ field }) => {
              return (
                <div className="flex items-center gap-2">
                  <Switch
                    id="mapStyle"
                    size="sm"
                    checked={field.value}
                    onCheckedChange={(checked) => setValue('active', checked)}
                  />
                  {/* <span>Status: </span> */}
                  <span>{field.value ? 'Ativo' : 'Inativo'}</span>
                </div>
              )
            }}
          />

          <div className="mt-4 flex w-full justify-end">
            <Button type="submit" disabled={isLoading}>
              {isPendingCreate || isPendingUpdate ? (
                <Spinner />
              ) : (
                <span>
                  {initialData && shouldFetchData ? 'Atualizar' : 'Adicionar'}
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
