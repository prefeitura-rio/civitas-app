'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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

  const { data: operationResponse, isLoading: isLoadingMonitoredPlate } =
    useQuery({
      queryKey: [`cars/monitored/${initialData?.id}`],
      queryFn: () =>
        initialData ? getMonitoredPlate({ plate: initialData?.id }) : null,
    })

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
    if (initialData && isOpen && !isLoading && operationResponse) {
      setValue('plate', operationResponse.data.plate)
      setValue('active', operationResponse.data.active)
      setValue('additionalInfo', operationResponse.data.additionalInfo)
      setValue('notes', operationResponse.data.notes)
      setValue('operation.id', operationResponse.data.operation.id)
      setValue('operation.title', operationResponse.data.operation.title)
      if (operationResponse.data.notificationChannels.length > 0) {
        setValue('notificationChannels', [
          operationResponse.data.notificationChannels[0],
          ...operationResponse.data.notificationChannels,
        ])
      }
      setIsLoading(false)
    }
  }, [isOpen, isLoading, operationResponse])

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
