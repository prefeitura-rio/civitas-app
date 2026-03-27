'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { InputError } from '@/components/custom/input-error'
import MultipleSelector from '@/components/custom/multiselect-with-search'
import { SelectWithSearch } from '@/components/custom/select-with-search'
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
      numeroControle: '',
      demandantLinkReference: '',
      demandantLinkValidUntil: '',
      active: true,
      notes: '',
      contactInfo: '',
      notificationChannels: [],
      operation: {
        id: '',
        title: '',
      },
    },
  })

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
        toast.error(
          `Placa ou número de controle já cadastrado (${variables.plate}).`,
        )
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
          'Não foi possível atualizar: placa ou número de controle em conflito.',
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
      setInitialData(null)
      setValue('notificationChannels', [])
      setValue('numeroControle', '')
      setValue('demandantLinkReference', '')
      setValue('demandantLinkValidUntil', '')
      setValue('operation.id', '')
      setValue('operation.title', '')
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
          numeroControle: props.numeroControle,
          notes: props.notes,
          notificationChannels,
        })
      } else {
        const rawUntil = props.demandantLinkValidUntil?.trim()
        let linkValidUntil: string | undefined
        if (rawUntil) {
          const parsed = new Date(rawUntil)
          linkValidUntil = Number.isNaN(parsed.getTime())
            ? undefined
            : parsed.toISOString()
        }
        await createMonitoredPlateMutation({
          plate: props.plate,
          numeroControle: props.numeroControle,
          notes: props.notes,
          notificationChannels,
          demandantLinks:
            props.operation.id.trim() !== ''
              ? [
                  {
                    demandantId: props.operation.id,
                    referenceNumber: props.demandantLinkReference.trim(),
                    validUntil: linkValidUntil,
                    notes: props.contactInfo?.trim() || undefined,
                  },
                ]
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
        numeroControle: '',
        demandantLinkReference: '',
        demandantLinkValidUntil: '',
        active: true,
        notes: '',
        contactInfo: '',
        additionalInfo: undefined,
        notificationChannels: [],
        operation: { id: '', title: '' },
      })
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
      setValue('numeroControle', monitoredPlate.numeroControle ?? '')
      setValue('active', monitoredPlate.active)
      setValue('notes', monitoredPlate.notes)
      setValue('demandantLinkReference', '')
      setValue('demandantLinkValidUntil', '')
      setValue('contactInfo', '')
      setValue('operation', { id: '', title: '' })
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {initialData && shouldFetchData
                ? 'Atualizar placa monitorada'
                : 'Monitorar nova placa'}
            </DialogTitle>
            <DialogDescription>
              {initialData && shouldFetchData
                ? 'Altere dados da placa, canais e víncios com demandantes (validade, referência, notas e ativo).'
                : 'Cadastre uma nova placa a ser monitorada.'}
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
                <Label htmlFor="numeroControle">Nº de controle</Label>
                <InputError message={errors.numeroControle?.message} />
              </div>
              <Input
                id="numeroControle"
                {...register('numeroControle')}
                type="text"
                disabled={isLoading}
                autoComplete="off"
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

            {!isEditingExistingPlate && (
              <>
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <Label>Demandante (opcional)</Label>
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
                        options={demandants.map((item) => ({
                          label: `${item.name} (${item.organization.acronym})`,
                          value: item.id,
                        }))}
                        disabled={isLoading}
                        value={field.value}
                        placeholder="Selecione um demandante"
                        topAction={
                          <div className="flex justify-center p-2">
                            <Button
                              variant="link"
                              className="h-auto p-0"
                              onClick={() => {
                                setDemandantDialogInitial(null)
                                formDialogDisclosure.onOpen()
                              }}
                            >
                              Criar novo demandante
                            </Button>
                          </div>
                        }
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <Label htmlFor="demandantLinkReference">
                      Nº de referência do vínculo
                    </Label>
                    <InputError
                      message={errors.demandantLinkReference?.message}
                    />
                  </div>
                  <Input
                    id="demandantLinkReference"
                    {...register('demandantLinkReference')}
                    type="text"
                    maxLength={50}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <Label htmlFor="demandantLinkValidUntil">
                      Validade do vínculo (opcional)
                    </Label>
                    <InputError
                      message={errors.demandantLinkValidUntil?.message}
                    />
                  </div>
                  <Input
                    id="demandantLinkValidUntil"
                    {...register('demandantLinkValidUntil')}
                    type="datetime-local"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <Label htmlFor="contactInfo">
                      Notas do vínculo (opcional)
                    </Label>
                    <InputError message={errors.contactInfo?.message} />
                  </div>
                  <Textarea
                    id="contactInfo"
                    {...register('contactInfo')}
                    disabled={isLoading}
                    placeholder="Enviadas junto ao vínculo placa–demandante no cadastro"
                  />
                </div>
              </>
            )}

            {isEditingExistingPlate && monitoredPlate && (
              <MonitoredPlateDemandantLinksPanel
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

            {/* <Controller
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
                    <span>{field.value ? 'Ativo' : 'Inativo'}</span>
                  </div>
                )
              }}
            /> */}

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
