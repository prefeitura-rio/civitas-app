'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { InputError } from '@/components/custom/input-error'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type OrganizationForm,
  organizationFormSchema,
} from '@/contexts/organizations-context'
import { useOrganizations } from '@/hooks/useContexts/use-organizations-context'
import { createOrganization } from '@/http/organizations/create-organization'
import { getOrganization } from '@/http/organizations/get-organization'
import { updateOrganization } from '@/http/organizations/update-organization'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

interface OrganizationFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function OrganizationFormDialog({
  isOpen,
  onClose,
  onOpen,
}: OrganizationFormDialogProps) {
  const jurisdictionOptions = [
    { value: 'municipal', label: 'Municipal' },
    { value: 'state', label: 'Estadual' },
    { value: 'federal', label: 'Federal' },
    { value: 'other', label: 'Outros' },
  ] as const

  const [isLoading, setIsLoading] = useState(false)
  const {
    dialogInitialData: initialData,
    setDialogInitialData: setInitialData,
  } = useOrganizations()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrganizationForm>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
      organizationType: '',
      acronym: '',
      jurisdictionLevel: '',
    },
  })

  const { mutateAsync: createMutation, isPending: isPendingCreate } =
    useMutation({
      mutationFn: createOrganization,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations'] })
      },
      onError: () => {
        toast.error(genericErrorMessage)
      },
    })

  const { mutateAsync: updateMutation, isPending: isPendingUpdate } =
    useMutation({
      mutationFn: updateOrganization,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations'] })
      },
      onError: () => {
        toast.error(genericErrorMessage)
      },
    })

  const { data: organization, isLoading: isLoadingOrganization } = useQuery({
    queryKey: ['organizations', initialData?.id],
    queryFn: () => getOrganization({ id: initialData!.id }),
    enabled: Boolean(initialData?.id && isOpen),
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

  async function onSubmit(props: OrganizationForm) {
    if (initialData?.id) {
      await updateMutation({
        id: initialData.id,
        name: props.name,
        organizationType: props.organizationType,
        acronym: props.acronym,
        jurisdictionLevel: props.jurisdictionLevel,
      })
      toast.success('Requisitante atualizado.')
    } else {
      await createMutation({
        name: props.name,
        organizationType: props.organizationType,
        acronym: props.acronym,
        jurisdictionLevel: props.jurisdictionLevel,
      })
      toast.success('Requisitante criado.')
    }
    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (initialData && isOpen && organization && !isLoadingOrganization) {
      setValue('name', organization.name)
      setValue('organizationType', organization.organizationType)
      setValue('acronym', organization.acronym)
      setValue('jurisdictionLevel', organization.jurisdictionLevel)
    }
  }, [initialData, isOpen, organization, isLoadingOrganization, setValue])

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  useEffect(() => {
    if (isOpen && !initialData?.id) {
      reset({
        name: '',
        organizationType: '',
        acronym: '',
        jurisdictionLevel: '',
      })
    }
  }, [isOpen, initialData?.id, reset])

  useEffect(() => {
    if (
      isLoadingOrganization ||
      isSubmitting ||
      isPendingCreate ||
      isPendingUpdate
    )
      setIsLoading(true)
    else setIsLoading(false)
  }, [isLoadingOrganization, isSubmitting, isPendingCreate, isPendingUpdate])

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Editar requisitante' : 'Novo requisitante'}
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="org-name">Requisitante</Label>
              <InputError message={errors.name?.message} />
            </div>
            <Input
              id="org-name"
              {...register('name')}
              disabled={isLoading}
              placeholder="Ex.: 10ª DP - Botafogo"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="org-type">Tipo</Label>
              <InputError message={errors.organizationType?.message} />
            </div>
            <Input
              id="org-type"
              {...register('organizationType')}
              placeholder="Ex.: Delegacia de Polícia Civil"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="org-acronym">Órgão</Label>
              <InputError message={errors.acronym?.message} />
            </div>
            <Input
              id="org-acronym"
              {...register('acronym')}
              disabled={isLoading}
              placeholder="Ex.: PCERJ"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label>Competência</Label>
              <InputError message={errors.jurisdictionLevel?.message} />
            </div>
            <Controller
              control={control}
              name="jurisdictionLevel"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="org-jurisdiction">
                    <SelectValue placeholder="Selecione (ex.: Estadual)" />
                  </SelectTrigger>
                  <SelectContent>
                    {jurisdictionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
