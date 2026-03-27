'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { InputError } from '@/components/custom/input-error'
import { SelectWithSearch } from '@/components/custom/select-with-search'
import { Spinner } from '@/components/custom/spinner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  type DemandantForm,
  demandantFormSchema,
} from '@/contexts/demandants-context'
import { useDemandantsContext } from '@/hooks/useContexts/use-demandants-context'
import { createDemandant } from '@/http/demandants/create-demandant'
import { getDemandant } from '@/http/demandants/get-demandant'
import { updateDemandant } from '@/http/demandants/update-demandant'
import { getOrganizations } from '@/http/organizations/get-organizations'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

interface DemandantFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function DemandantFormDialog({
  isOpen,
  onClose,
  onOpen,
}: DemandantFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    dialogInitialData: initialData,
    setDialogInitialData: setInitialData,
  } = useDemandantsContext()

  const form = useForm<DemandantForm>({
    resolver: zodResolver(demandantFormSchema),
    defaultValues: {
      organizationId: '',
      name: '',
      email: '',
      phone1: '',
      phone2: '',
      phone3: '',
    },
  })

  const { register, handleSubmit, setValue, control, formState, reset } = form
  const { errors, isSubmitting } = formState

  const { data: organizationsResponse } = useQuery({
    queryKey: ['organizations', 'options', 100],
    queryFn: () => getOrganizations({ page: 1, size: 100 }),
    enabled: isOpen,
  })

  const organizations = organizationsResponse?.data.items ?? []

  const { mutateAsync: createMutation, isPending: isPendingCreate } =
    useMutation({
      mutationFn: createDemandant,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['demandants'] })
      },
      onError: () => toast.error(genericErrorMessage),
    })

  const { mutateAsync: updateMutation, isPending: isPendingUpdate } =
    useMutation({
      mutationFn: updateDemandant,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['demandants'] })
      },
      onError: () => toast.error(genericErrorMessage),
    })

  const { data: demandant, isLoading: isLoadingDemandant } = useQuery({
    queryKey: ['demandants', initialData?.id],
    queryFn: () => getDemandant({ id: initialData!.id }),
    enabled: Boolean(initialData?.id && isOpen),
  })

  function handleOnOpenChange(open: boolean) {
    if (open) onOpen()
    else {
      onClose()
      reset()
      setInitialData(null)
    }
  }

  function emptyToUndefined(s: string) {
    const t = s.trim()
    return t === '' ? undefined : t
  }

  async function onSubmit(props: DemandantForm) {
    if (initialData?.id) {
      await updateMutation({
        id: initialData.id,
        organizationId: props.organizationId,
        name: emptyToUndefined(props.name),
        email: emptyToUndefined(props.email),
        phone1: emptyToUndefined(props.phone1),
        phone2: props.phone2.trim() === '' ? null : props.phone2,
        phone3: props.phone3.trim() === '' ? null : props.phone3,
      })
      toast.success('Demandante atualizado.')
    } else {
      await createMutation({
        organizationId: props.organizationId,
        name: emptyToUndefined(props.name),
        email: emptyToUndefined(props.email),
        phone1: emptyToUndefined(props.phone1),
        phone2: props.phone2.trim() === '' ? null : props.phone2,
        phone3: props.phone3.trim() === '' ? null : props.phone3,
      })
      toast.success('Demandante criado.')
    }
    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (initialData && isOpen && demandant && !isLoadingDemandant) {
      setValue('organizationId', demandant.organizationId)
      setValue('name', demandant.name)
      setValue('email', demandant.email)
      setValue('phone1', demandant.phone1)
      setValue('phone2', demandant.phone2 ?? '')
      setValue('phone3', demandant.phone3 ?? '')
    }
  }, [initialData, isOpen, demandant, isLoadingDemandant, setValue])

  useEffect(() => {
    if (isOpen && !initialData) {
      reset({
        organizationId: '',
        name: '',
        email: '',
        phone1: '',
        phone2: '',
        phone3: '',
      })
    }
  }, [isOpen, initialData, reset])

  useEffect(() => {
    if (
      isLoadingDemandant ||
      isSubmitting ||
      isPendingCreate ||
      isPendingUpdate
    )
      setIsLoading(true)
    else setIsLoading(false)
  }, [isLoadingDemandant, isSubmitting, isPendingCreate, isPendingUpdate])

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Editar demandante' : 'Novo demandante'}
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label>Organização</Label>
              <InputError message={errors.organizationId?.message} />
            </div>
            <Controller
              control={control}
              name="organizationId"
              render={({ field }) => {
                const selected = organizations.find((o) => o.id === field.value)
                const display = selected
                  ? `${selected.name} (${selected.acronym})`
                  : ''
                return (
                  <SelectWithSearch
                    disabled={isLoading}
                    value={display}
                    placeholder="Selecione a organização"
                    options={organizations.map((o) => ({
                      label: `${o.name} (${o.acronym})`,
                      value: o.id,
                    }))}
                    onSelect={(item) => setValue('organizationId', item.value)}
                  />
                )
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="dem-name">Nome</Label>
              <InputError message={errors.name?.message} />
            </div>
            <Input id="dem-name" {...register('name')} disabled={isLoading} />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="dem-email">E-mail</Label>
              <InputError message={errors.email?.message} />
            </div>
            <Input
              id="dem-email"
              type="email"
              {...register('email')}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="dem-p1">Telefone 1</Label>
              <InputError message={errors.phone1?.message} />
            </div>
            <Input id="dem-p1" {...register('phone1')} disabled={isLoading} />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="dem-p2">Telefone 2</Label>
              <InputError message={errors.phone2?.message} />
            </div>
            <Input id="dem-p2" {...register('phone2')} disabled={isLoading} />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="dem-p3">Telefone 3</Label>
              <InputError message={errors.phone3?.message} />
            </div>
            <Input id="dem-p3" {...register('phone3')} disabled={isLoading} />
          </div>

          <div className="mt-2 flex w-full justify-end">
            <Button type="submit" disabled={isLoading}>
              {isPendingCreate || isPendingUpdate ? (
                <Spinner />
              ) : (
                <span>{initialData?.id ? 'Salvar' : 'Criar'}</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
