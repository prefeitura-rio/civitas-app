'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { InputError } from '@/components/custom/input-error'
import MultipleSelector from '@/components/custom/multiselect-with-search'
import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useMonitoredPlates } from '@/hooks/useContexts/use-monitored-plates-context'
import { getInstitutionAuthorities } from '@/http/institution-authorities'
import { createMonitoredPlateRegistration } from '@/http/monitored-plate-registrations'
import {
  getMonitoredPlate,
  updateMonitoredPlate,
} from '@/http/monitored-plates'
import { getNotificationChannels } from '@/http/notification-channels/get-notification-channels'
import { queryClient } from '@/lib/react-query'
import {
  genericErrorMessage,
  isConflictError,
  isNotFoundError,
} from '@/utils/error-handlers'

import { MonitoredPlateAuthorityLinksPanel } from './monitored-plate-authority-links-panel'
import type { MonitoredPlateDraftAuthorityLink } from './monitored-plate-draft-authority-link'

const MONITORED_PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/

interface MonitoredPlateDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  shouldFetchData?: boolean
}

const optionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

const monitoredPlateCreateFormSchema = z.object({
  plate: z
    .string()
    .trim()
    .min(1, { message: 'Campo obrigatório' })
    .toUpperCase()
    .regex(MONITORED_PLATE_REGEX, 'Formato inválido'),
  active: z.boolean().default(true),
  notes: z.string(),
  notificationChannels: z.array(optionSchema),
})

const monitoredPlateEditFormSchema = z.object({
  plate: z.string(),
  active: z.boolean().default(true),
  notes: z.string(),
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
  const {
    dialogInitialData: initialData,
    setDialogInitialData: setInitialData,
  } = useMonitoredPlates()

  const isEditingExistingPlate = Boolean(initialData?.plate && shouldFetchData)

  const createForm = useForm<MonitoredPlateCreateForm>({
    resolver: zodResolver(monitoredPlateCreateFormSchema),
    defaultValues: {
      plate: '',
      active: true,
      notes: '',
      notificationChannels: [],
    },
  })

  const editForm = useForm<MonitoredPlateEditForm>({
    resolver: zodResolver(monitoredPlateEditFormSchema),
    defaultValues: {
      plate: '',
      active: true,
      notes: '',
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = createForm

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
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

  const notificationChannelOptions = useMemo(
    () =>
      notificationChannels.map((item) => ({
        label: item.title || item.id,
        value: item.id,
      })),
    [notificationChannels],
  )

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
      active: true,
      notes: '',
      notificationChannels: [],
    })
    resetEdit({
      plate: '',
      active: true,
      notes: '',
    })
    setDraftLinks([])
    setInitialData(null)
  }

  async function onSubmit(values: MonitoredPlateCreateForm) {
    if (draftLinks.length === 0) {
      toast.error('Adicione ao menos um vínculo com requisitante.')
      return
    }

    await createRegistrationMutation({
      plate: values.plate,
      active: values.active,
      notes: values.notes.trim() || null,
      additionalInfo: null,
      authorities: draftLinks.map((link) => ({
        institutionAuthorityId: link.institutionAuthorityId,
        referenceNumber: link.referenceNumber.trim(),
        requestedAt: link.requestedAt,
        validUntil: link.validUntil,
        active: link.active,
        monitorAllCollectionPoints: link.monitorAllCollectionPoints,
        notificationChannelIds:
          link.notificationChannelIds && link.notificationChannelIds.length > 0
            ? link.notificationChannelIds
            : values.notificationChannels.map((item) => item.value),
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

    await updateMonitoredPlateMutation({
      plate,
      active: values.active,
      notes: values.notes.trim() || null,
      additionalInfo: monitoredPlate?.additionalInfo ?? null,
    })

    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (!isOpen) return

    if (isEditingExistingPlate) {
      if (monitoredPlate) {
        resetEdit({
          plate: monitoredPlate.plate,
          active: monitoredPlate.active,
          notes: monitoredPlate.notes ?? '',
        })
      }
      return
    }

    reset({
      plate: initialData?.plate ?? '',
      active: true,
      notes: '',
      notificationChannels: [],
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
            Dados da placa, canais de notificação e vínculos com requisitantes.
          </DialogDescription>
        </DialogHeader>

        {isEditingExistingPlate ? (
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

            {monitoredPlate ? (
              <MonitoredPlateAuthorityLinksPanel
                mode="persisted"
                plate={monitoredPlate.plate}
                monitoredPlateId={monitoredPlate.id}
                links={monitoredPlate.authorities}
                institutionAuthorities={institutionAuthorities}
                notificationChannels={notificationChannels}
                disabled={isEditLoading}
              />
            ) : null}

            <div className="mt-4 flex w-full justify-end">
              <Button type="submit" disabled={isEditLoading || !monitoredPlate}>
                {isEditLoading ? <Spinner /> : <span>Atualizar</span>}
              </Button>
            </div>
          </form>
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

            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <Label>Canal de notificação padrão</Label>
                <InputError
                  message={
                    errors.notificationChannels?.message as string | undefined
                  }
                />
              </div>
              <Controller
                control={control}
                name="notificationChannels"
                render={({ field }) => (
                  <MultipleSelector
                    value={field.value}
                    onChange={field.onChange}
                    defaultOptions={notificationChannelOptions}
                    options={notificationChannelOptions}
                    disabled={isCreateLoading}
                    placeholder="Selecione um canal"
                    emptyIndicator={<p>Nenhum resultado encontrado.</p>}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                Usado como padrão quando um vínculo não define canais próprios.
              </p>
            </div>

            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <label className="flex items-center gap-3 rounded-md border p-3">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(value) => field.onChange(Boolean(value))}
                    disabled={isCreateLoading}
                  />
                  <span className="text-sm">Criar placa como ativa</span>
                </label>
              )}
            />

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
