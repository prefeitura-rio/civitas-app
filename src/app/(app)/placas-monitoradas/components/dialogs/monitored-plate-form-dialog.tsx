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
    watch,
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

  const { data: monitoredPlatesResponse, isLoading: isLoadingMonitoredPlates } =
    useQuery({
      queryKey: [`cars/monitored/${initialData?.plate}`],
      queryFn: () =>
        initialData ? getMonitoredPlate({ plate: initialData?.plate }) : null,
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
    if (initialData?.plate) {
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
    if (initialData && isOpen && !isLoading && monitoredPlatesResponse) {
      setValue('plate', monitoredPlatesResponse.data.plate)
      setValue('active', monitoredPlatesResponse.data.active)
      setValue('additionalInfo', monitoredPlatesResponse.data.additionalInfo)
      setValue('notes', monitoredPlatesResponse.data.notes)
      console.log({ id: monitoredPlatesResponse.data })
      setValue('operation.id', monitoredPlatesResponse.data.operation.id || '')
      setValue(
        'operation.title',
        monitoredPlatesResponse.data.operation.title || '',
      )
      if (monitoredPlatesResponse.data.notificationChannels.length > 0) {
        const channelOptions =
          monitoredPlatesResponse.data.notificationChannels.map((item) => {
            return {
              label: item.title,
              value: item.id,
            }
          })
        setValue('notificationChannels', channelOptions)
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

  console.table(errors)
  console.log({
    operationTitle: watch('operation.title'),
    operationId: watch('operation.id'),
    operation: watch('operation'),
    channels: watch('notificationChannels'),
  })
  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Operação</DialogTitle>
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
                  placeholder="Selecione um canal"
                  emptyIndicator={<p>Nenhum resoltado encontrado.</p>}
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
                <span>Adicionar</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
