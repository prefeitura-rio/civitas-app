'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { InputError } from '@/components/custom/input-error'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useMonitoredPlates } from '@/hooks/useContexts/use-monitored-plates-context'
import { getInstitutionAuthorities } from '@/http/institution-authorities'
import { createMonitoredPlateRegistration } from '@/http/monitored-plate-registrations'
import {
  getMonitoredPlate,
  updateMonitoredPlate,
} from '@/http/monitored-plates'
import { getNotificationChannels } from '@/http/notification-channels/get-notification-channels'
import { queryClient } from '@/lib/react-query'
import type { VehicleType } from '@/models/monitored-plates'
import {
  genericErrorMessage,
  isConflictError,
  isNotFoundError,
} from '@/utils/error-handlers'

import {
  MonitoredPlateAuthorityLinksPanel,
  type MonitoredPlateAuthorityLinksPanelHandle,
} from './monitored-plate-authority-links-panel'
import type { MonitoredPlateDraftAuthorityLink } from './monitored-plate-draft-authority-link'

const MONITORED_PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/

const VEHICLE_TYPE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'automovel', label: 'Automóvel' },
  { value: 'motocicleta', label: 'Motocicleta' },
  { value: 'caminhao', label: 'Caminhão' },
  { value: 'onibus', label: 'Ônibus' },
  { value: 'utilitario', label: 'Utilitário' },
  { value: 'van', label: 'Van / Microônibus' },
  { value: 'reboque', label: 'Reboque / Semi-reboque' },
  { value: 'trator', label: 'Trator' },
  { value: 'outro', label: 'Outro' },
]

const vehicleTypeSchema = z.enum([
  'automovel',
  'motocicleta',
  'caminhao',
  'onibus',
  'utilitario',
  'van',
  'reboque',
  'trator',
  'outro',
])

interface MonitoredPlateDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  shouldFetchData?: boolean
}

const vehicleFieldsSchema = {
  vehicleType: vehicleTypeSchema.optional().nullable(),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  modelYear: z.string().max(4).optional().nullable(),
  manufactureYear: z.string().max(4).optional().nullable(),
  color: z.string().optional().nullable(),
}

const monitoredPlateCreateFormSchema = z.object({
  plate: z
    .string()
    .trim()
    .min(1, { message: 'Campo obrigatório' })
    .toUpperCase()
    .regex(MONITORED_PLATE_REGEX, 'Formato inválido'),
  notes: z.string(),
  ...vehicleFieldsSchema,
})

const monitoredPlateEditFormSchema = z.object({
  plate: z.string(),
  notes: z.string(),
  ...vehicleFieldsSchema,
})

type MonitoredPlateCreateForm = z.infer<typeof monitoredPlateCreateFormSchema>
type MonitoredPlateEditForm = z.infer<typeof monitoredPlateEditFormSchema>

export function MonitoredPlateFormDialog({
  isOpen,
  onClose,
  onOpen,
  shouldFetchData = true,
}: MonitoredPlateDialogProps) {
  const [draftLinks, setDraftLinks] = useState<
    MonitoredPlateDraftAuthorityLink[]
  >([])
  const authorityLinksPanelRef =
    useRef<MonitoredPlateAuthorityLinksPanelHandle>(null)
  const {
    dialogInitialData: initialData,
    setDialogInitialData: setInitialData,
  } = useMonitoredPlates()

  const isEditingExistingPlate = Boolean(initialData?.plate && shouldFetchData)

  const createForm = useForm<MonitoredPlateCreateForm>({
    resolver: zodResolver(monitoredPlateCreateFormSchema),
    defaultValues: {
      plate: '',
      notes: '',
    },
  })

  const editForm = useForm<MonitoredPlateEditForm>({
    resolver: zodResolver(monitoredPlateEditFormSchema),
    defaultValues: {
      plate: '',
      notes: '',
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = createForm

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    control: controlEdit,
    formState: { errors: editErrors, isSubmitting: isSubmittingEdit },
    reset: resetEdit,
  } = editForm

  const currentPlate = watch('plate', '')
  const typedPlate = currentPlate.trim().toUpperCase()
  const isValidTypedPlate = MONITORED_PLATE_REGEX.test(typedPlate)

  const { data: monitoredPlate, isLoading: isLoadingMonitoredPlate } = useQuery(
    {
      queryKey: ['monitored-plates', initialData?.plate],
      queryFn: () => getMonitoredPlate({ plate: initialData!.plate }),
      enabled: Boolean(isOpen && isEditingExistingPlate && initialData?.plate),
    },
  )

  // Em modo criação: se a placa digitada já existe, troca para edição.
  const { data: existingPlateLookup, isFetching: isCheckingExistingPlate } =
    useQuery({
      queryKey: ['monitored-plates', 'lookup', typedPlate],
      queryFn: async () => {
        try {
          const existing = await getMonitoredPlate({ plate: typedPlate })
          queryClient.setQueryData(
            ['monitored-plates', existing.plate],
            existing,
          )
          return existing
        } catch (error) {
          if (isNotFoundError(error)) return null
          throw error
        }
      },
      enabled: Boolean(
        isOpen && !isEditingExistingPlate && isValidTypedPlate && typedPlate,
      ),
      retry: false,
      staleTime: 30_000,
    })

  useEffect(() => {
    if (!isOpen || isEditingExistingPlate) return
    if (!existingPlateLookup?.plate) return
    if (initialData?.plate === existingPlateLookup.plate) return

    setDraftLinks([])
    setInitialData({ plate: existingPlateLookup.plate })
    toast.message(
      `A placa ${existingPlateLookup.plate} já está cadastrada. Abrindo edição.`,
    )
  }, [
    existingPlateLookup,
    initialData?.plate,
    isEditingExistingPlate,
    isOpen,
    setInitialData,
  ])

  const { data: institutionAuthoritiesResponse } = useQuery({
    queryKey: ['institution-authorities', 'options', 100],
    queryFn: () => getInstitutionAuthorities({ page: 1, size: 100 }),
    enabled: isOpen,
  })

  const { data: notificationChannelsResponse } = useQuery({
    queryKey: ['notification-channels', 'options', 100],
    queryFn: () => getNotificationChannels({ size: 100 }),
    enabled: isOpen,
  })

  const institutionAuthorities =
    institutionAuthoritiesResponse?.data.items ?? []
  const notificationChannels = notificationChannelsResponse?.data.items ?? []

  const {
    mutateAsync: createRegistrationMutation,
    isPending: isPendingCreate,
  } = useMutation({
    mutationFn: createMonitoredPlateRegistration,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cars', 'monitored'] })
      queryClient.invalidateQueries({ queryKey: ['monitored-plates'] })
      queryClient.invalidateQueries({
        queryKey: ['monitored-plates', data.plate],
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cars', 'monitored'] })
      queryClient.invalidateQueries({ queryKey: ['monitored-plates'] })
      queryClient.invalidateQueries({
        queryKey: ['monitored-plates', data.plate],
      })
      toast.success(`A placa ${data.plate} foi atualizada com sucesso!`)
    },
    onError: () => {
      toast.error(genericErrorMessage)
    },
  })

  function handleOnOpenChange(open: boolean) {
    if (open) {
      onOpen()
      return
    }

    onClose()
    reset({
      plate: '',
      notes: '',
      vehicleType: null,
      brand: null,
      model: null,
      modelYear: null,
      manufactureYear: null,
      color: null,
    })
    resetEdit({
      plate: '',
      notes: '',
      vehicleType: null,
      brand: null,
      model: null,
      modelYear: null,
      manufactureYear: null,
      color: null,
    })
    setDraftLinks([])
    setInitialData(null)
  }

  async function onSubmit(values: MonitoredPlateCreateForm) {
    if (draftLinks.length === 0) {
      toast.error('Adicione ao menos um vínculo com requisitante.')
      return
    }

    const hasVehicleData = Boolean(
      values.vehicleType || values.brand || values.model || values.color,
    )

    await createRegistrationMutation({
      plate: values.plate,
      notes: values.notes.trim() || null,
      additionalInfo: null,
      vehicleType: values.vehicleType ?? null,
      brand: values.brand?.trim() || null,
      model: values.model?.trim() || null,
      modelYear: values.modelYear?.trim() || null,
      manufactureYear: values.manufactureYear?.trim() || null,
      color: values.color?.trim() || null,
      vehicleInfoSource: hasVehicleData ? 'manual' : null,
      authorities: draftLinks.map((link) => ({
        institutionAuthorityId: link.institutionAuthorityId,
        referenceNumber: link.referenceNumber.trim(),
        requestedAt: link.requestedAt,
        validUntil: link.validUntil,
        active: link.active,
        monitorAllCollectionPoints: link.monitorAllCollectionPoints,
        notificationChannelIds: link.notificationChannelIds ?? [],
        collectionPointIds: link.collectionPointIds ?? [],
      })),
    })

    handleOnOpenChange(false)
  }

  async function onSubmitEdit(values: MonitoredPlateEditForm) {
    const plate = monitoredPlate?.plate ?? initialData?.plate

    if (!plate) {
      toast.error(genericErrorMessage)
      return
    }

    const hasVehicleData = Boolean(
      values.vehicleType || values.brand || values.model || values.color,
    )

    await updateMonitoredPlateMutation({
      plate,
      notes: values.notes.trim() || null,
      additionalInfo: monitoredPlate?.additionalInfo ?? null,
      vehicleType: values.vehicleType ?? null,
      brand: values.brand?.trim() || null,
      model: values.model?.trim() || null,
      modelYear: values.modelYear?.trim() || null,
      manufactureYear: values.manufactureYear?.trim() || null,
      color: values.color?.trim() || null,
      vehicleInfoSource: hasVehicleData ? 'manual' : null,
    })
    await authorityLinksPanelRef.current?.flushPendingActiveChanges()

    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (!isOpen) return

    if (isEditingExistingPlate) {
      if (monitoredPlate) {
        resetEdit({
          plate: monitoredPlate.plate,
          notes: monitoredPlate.notes ?? '',
          vehicleType: monitoredPlate.vehicleType ?? null,
          brand: monitoredPlate.brand ?? null,
          model: monitoredPlate.model ?? null,
          modelYear: monitoredPlate.modelYear ?? null,
          manufactureYear: monitoredPlate.manufactureYear ?? null,
          color: monitoredPlate.color ?? null,
        })
      }
      return
    }

    reset({
      plate: initialData?.plate ?? '',
      notes: '',
      vehicleType: null,
      brand: null,
      model: null,
      modelYear: null,
      manufactureYear: null,
      color: null,
    })
    setDraftLinks([])
  }, [
    initialData?.plate,
    isEditingExistingPlate,
    isOpen,
    monitoredPlate,
    reset,
    resetEdit,
  ])

  const isCreateLoading = isSubmitting || isPendingCreate
  const isEditLoading =
    isLoadingMonitoredPlate || isSubmittingEdit || isPendingUpdate

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditingExistingPlate
              ? 'Editar placa monitorada'
              : 'Nova placa monitorada'}
          </DialogTitle>
          <DialogDescription>
            Dados da placa e vínculos com requisitantes.
          </DialogDescription>
        </DialogHeader>

        {isEditingExistingPlate ? (
          isLoadingMonitoredPlate || !monitoredPlate ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="size-6" />
            </div>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={handleEditSubmit(onSubmitEdit)}
            >
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <Label htmlFor="edit-plate">Placa</Label>
                  <InputError message={editErrors.plate?.message} />
                </div>
                <Input id="edit-plate" {...registerEdit('plate')} disabled />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <Label htmlFor="edit-notes">Observações (placa)</Label>
                  <InputError message={editErrors.notes?.message} />
                </div>
                <Textarea
                  id="edit-notes"
                  {...registerEdit('notes')}
                  disabled={isEditLoading}
                />
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Dados do veículo
                </p>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-vehicle-type">Tipo</Label>
                  <Controller
                    name="vehicleType"
                    control={controlEdit}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ''}
                        onValueChange={(v) => field.onChange(v || null)}
                        disabled={isEditLoading}
                      >
                        <SelectTrigger id="edit-vehicle-type">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {VEHICLE_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-brand">Marca</Label>
                    <Input
                      id="edit-brand"
                      {...registerEdit('brand')}
                      disabled={isEditLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-model">Modelo</Label>
                    <Input
                      id="edit-model"
                      {...registerEdit('model')}
                      disabled={isEditLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-model-year">Ano modelo</Label>
                    <Input
                      id="edit-model-year"
                      maxLength={4}
                      {...registerEdit('modelYear')}
                      disabled={isEditLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="edit-manufacture-year">
                      Ano fabricação
                    </Label>
                    <Input
                      id="edit-manufacture-year"
                      maxLength={4}
                      {...registerEdit('manufactureYear')}
                      disabled={isEditLoading}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-color">Cor</Label>
                  <Input
                    id="edit-color"
                    {...registerEdit('color')}
                    disabled={isEditLoading}
                  />
                </div>
              </div>

              <MonitoredPlateAuthorityLinksPanel
                ref={authorityLinksPanelRef}
                mode="persisted"
                plate={monitoredPlate.plate}
                monitoredPlateId={monitoredPlate.id}
                links={monitoredPlate.authorities}
                institutionAuthorities={institutionAuthorities}
                notificationChannels={notificationChannels}
                disabled={isEditLoading}
              />

              <div className="mt-4 flex w-full justify-end">
                <Button type="submit" disabled={isEditLoading}>
                  {isPendingUpdate || isSubmittingEdit ? (
                    <Spinner />
                  ) : (
                    <span>Atualizar</span>
                  )}
                </Button>
              </div>
            </form>
          )
        ) : (
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
                  setValue('plate', e.target.value.toUpperCase(), {
                    shouldValidate: true,
                  })
                }
                disabled={isCreateLoading || !!initialData}
              />
              {isCheckingExistingPlate ? (
                <p className="text-xs text-muted-foreground">
                  Verificando se a placa já está cadastrada…
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <Label htmlFor="notes">Observações (placa)</Label>
                <InputError message={errors.notes?.message} />
              </div>
              <Textarea
                id="notes"
                {...register('notes')}
                disabled={isCreateLoading}
              />
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                Dados do veículo
              </p>

              <div className="flex flex-col gap-1">
                <Label htmlFor="vehicle-type">Tipo</Label>
                <Controller
                  name="vehicleType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v || null)}
                      disabled={isCreateLoading}
                    >
                      <SelectTrigger id="vehicle-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    {...register('brand')}
                    disabled={isCreateLoading}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    {...register('model')}
                    disabled={isCreateLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="model-year">Ano modelo</Label>
                  <Input
                    id="model-year"
                    maxLength={4}
                    {...register('modelYear')}
                    disabled={isCreateLoading}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="manufacture-year">Ano fabricação</Label>
                  <Input
                    id="manufacture-year"
                    maxLength={4}
                    {...register('manufactureYear')}
                    disabled={isCreateLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  {...register('color')}
                  disabled={isCreateLoading}
                />
              </div>
            </div>

            <MonitoredPlateAuthorityLinksPanel
              mode="draft"
              plate={currentPlate?.trim() ?? ''}
              draftLinks={draftLinks}
              onDraftLinksChange={setDraftLinks}
              institutionAuthorities={institutionAuthorities}
              notificationChannels={notificationChannels}
              disabled={isCreateLoading}
            />

            <div className="mt-4 flex w-full justify-end">
              <Button type="submit" disabled={isCreateLoading}>
                {isCreateLoading ? <Spinner /> : <span>Adicionar</span>}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
