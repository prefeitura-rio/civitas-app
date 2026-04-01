'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { InputError } from '@/components/custom/input-error'
import MultipleSelector from '@/components/custom/multiselect-with-search'
import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  type MonitoredPlateForm,
  monitoredPlateFormSchema,
} from '@/contexts/monitored-plates-context'
import { useDemandantsContext } from '@/hooks/useContexts/use-demandants-context'
import { useMonitoredPlates } from '@/hooks/useContexts/use-monitored-plates-context'
import { createMonitoredPlate } from '@/http/cars/monitored/create-monitored-plate'
import { getMonitoredPlate } from '@/http/cars/monitored/get-monitored-plate'
import { updateMonitoredPlate } from '@/http/cars/monitored/update-monitored-plate'
import { getDemandants } from '@/http/demandants/get-demandants'
import { getNotificationChannels } from '@/http/notification-channels/get-notification-channels'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage, isConflictError } from '@/utils/error-handlers'

import { DemandantFormDialog } from '../demandantes/components/demandants-section/demandant-dialogs/demandant-form-dialog'
import { MonitoredPlateDemandantLinksPanel } from './monitored-plate-demandant-links-panel'
import type { MonitoredPlateDraftDemandantLink } from './monitored-plate-draft-demandant-link'

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
  const [draftLinks, setDraftLinks] = useState<
    MonitoredPlateDraftDemandantLink[]
  >([])
  const {
    formDialogDisclosure,
    setDialogInitialData: setDemandantDialogInitial,
  } = useDemandantsContext()

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
      plate: '',
      active: true,
      notes: '',
      notificationChannels: [],
    },
  })

  const currentPlate = useWatch({ control, name: 'plate', defaultValue: '' })

  const isEditingExistingPlate = Boolean(initialData && shouldFetchData)

  const {
    mutateAsync: createMonitoredPlateMutation,
    isPending: isPendingCreate,
  } = useMutation({
    mutationFn: createMonitoredPlate,
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: ['cars', 'monitored'],
      })
      queryClient.invalidateQueries({
        queryKey: ['cars', 'monitored', data.plate],
      })
      toast.success(`A placa ${data.plate} foi cadastrada com sucesso!`)
    },
    onError: (error, variables) => {
      console.error('Error:', error)
      if (isConflictError(error)) {
        toast.error(`Esta placa já está cadastrada (${variables.plate}).`)
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
        queryKey: ['cars', 'monitored', data.plate],
      })
      queryClient.invalidateQueries({
        queryKey: ['cars', 'monitored'],
      })
      toast.success(`A placa ${data.plate} foi atualizada com sucesso!`)
    },
    onError: (error) => {
      console.error('Error2:', error)
      if (isConflictError(error)) {
        toast.error(
          'Não foi possível atualizar: conflito com outro cadastro desta placa.',
        )
      } else {
        toast.error(genericErrorMessage)
      }
    },
  })

  const { data: monitoredPlate, isLoading: isLoadingMonitoredPlate } = useQuery(
    {
      queryKey: ['cars', 'monitored', initialData?.plate],
      queryFn: () => getMonitoredPlate({ plate: initialData?.plate || '' }),
      enabled: !!initialData && shouldFetchData,
    },
  )

  const { data: demandantsResponse } = useQuery({
    queryKey: ['demandants', 'options', 100],
    queryFn: () => getDemandants({ page: 1, size: 100 }),
  })
  const { data: NotificationChannelResponse } = useQuery({
    queryKey: ['notification-channels'],
    queryFn: () => getNotificationChannels({ size: 100 }),
  })

  const demandants = demandantsResponse?.data.items || []

  function handleOnOpenChange(open: boolean) {
    if (open) {
      onOpen()
    } else {
      onClose()
      reset()
      setDraftLinks([])
      setInitialData(null)
      setValue('notificationChannels', [])
    }
  }

  async function onSubmit(props: MonitoredPlateForm) {
    try {
      const notificationChannels = props.notificationChannels.map(
        (item) => item.value,
      )
      if (initialData?.plate && shouldFetchData) {
        await updateMonitoredPlateMutation({
          plate: initialData.plate,
          notes: props.notes,
          notificationChannels,
        })
      } else {
        await createMonitoredPlateMutation({
          plate: props.plate,
          notes: props.notes,
          notificationChannels,
          demandantLinks:
            draftLinks.length > 0
              ? draftLinks.map((d) => ({
                  demandantId: d.demandantId,
                  referenceNumber: d.referenceNumber.trim(),
                  validUntil: d.validUntil,
                  notes: d.notes?.trim() || undefined,
                  lprEquipmentIds:
                    d.lprEquipmentIds && d.lprEquipmentIds.length > 0
                      ? d.lprEquipmentIds
                      : undefined,
                }))
              : undefined,
        })
      }
      handleOnOpenChange(false)
    } catch (error) {
      // Errors are already handled in the onError callback, so no need to do anything here
    }
  }

  useEffect(() => {
    if (isOpen && !initialData) {
      reset({
        plate: '',
        active: true,
        notes: '',
        additionalInfo: undefined,
        notificationChannels: [],
      })
      setDraftLinks([])
    }
  }, [isOpen, initialData, reset])

  useEffect(() => {
    if (
      initialData &&
      isOpen &&
      !isLoading &&
      monitoredPlate &&
      shouldFetchData
    ) {
      setValue('plate', monitoredPlate.plate)
      setValue('active', monitoredPlate.active)
      setValue('notes', monitoredPlate.notes)
      if (monitoredPlate.notificationChannels.length > 0) {
        const channelOptions = monitoredPlate.notificationChannels.map(
          (item) => {
            return {
              label: item.title,
              value: item.id,
            }
          },
        )
        setValue('notificationChannels', channelOptions)
      } else {
        setValue('notificationChannels', [])
      }
      setIsLoading(false)
    }

    if (initialData && isOpen && !shouldFetchData) {
      setValue('plate', initialData.plate)
    }
  }, [
    isOpen,
    isLoading,
    monitoredPlate,
    initialData,
    shouldFetchData,
    setValue,
  ])

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
    <>
      <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Placa monitorada</DialogTitle>
            <DialogDescription>
              Dados da placa, canais de notificação e vínculos com demandantes.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <Label htmlFor="plate">Placa</Label>
                <InputError message={errors.plate?.message} />
              </div>
              <Input
                id="plate"
                {...register('plate')}
                type="text"
                onChange={(e) =>
                  setValue('plate', e.target.value.toUpperCase())
                }
                disabled={isLoading || !!initialData}
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <Label htmlFor="notes">Observações (placa)</Label>
                <InputError message={errors.notes?.message} />
              </div>
              <Textarea
                id="notes"
                {...register('notes')}
                disabled={isLoading}
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

            {isEditingExistingPlate && monitoredPlate && (
              <MonitoredPlateDemandantLinksPanel
                mode="persisted"
                plate={monitoredPlate.plate}
                links={monitoredPlate.demandantLinks}
                demandants={demandants}
                disabled={isLoading}
                onOpenCreateDemandant={() => {
                  setDemandantDialogInitial(null)
                  formDialogDisclosure.onOpen()
                }}
              />
            )}

            {!isEditingExistingPlate && (
              <MonitoredPlateDemandantLinksPanel
                mode="draft"
                plate={currentPlate?.trim() ?? ''}
                draftLinks={draftLinks}
                onDraftLinksChange={setDraftLinks}
                demandants={demandants}
                disabled={isLoading}
                onOpenCreateDemandant={() => {
                  setDemandantDialogInitial(null)
                  formDialogDisclosure.onOpen()
                }}
              />
            )}

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

      <DemandantFormDialog
        isOpen={formDialogDisclosure.isOpen}
        onClose={formDialogDisclosure.onClose}
        onOpen={formDialogDisclosure.onOpen}
      />
    </>
  )
}
