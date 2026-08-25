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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type RequestingInstitutionForm,
  requestingInstitutionFormSchema,
} from '@/contexts/requesting-institutions-context'
import { useRequestingInstitutions } from '@/hooks/useContexts/use-requesting-institutions-context'
import {
  createRequestingInstitution,
  getRequestingInstitution,
  getRequestingInstitutions,
  updateRequestingInstitution,
} from '@/http/requesting-institutions'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

import { fetchRequestingInstitutionFieldPage } from '../../fetch-requesting-institution-field-page'

interface RequestingInstitutionFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

const jurisdictionOptions = [
  { value: 'municipal', label: 'Municipal' },
  { value: 'estadual', label: 'Estadual' },
  { value: 'distrital', label: 'Distrital' },
  { value: 'federal', label: 'Federal' },
  { value: 'outros', label: 'Outros' },
] as const

function normalizeDemandanteName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR')
}

export function RequestingInstitutionFormDialog({
  isOpen,
  onClose,
  onOpen,
}: RequestingInstitutionFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    dialogInitialData: initialData,
    setDialogInitialData: setInitialData,
  } = useRequestingInstitutions()

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RequestingInstitutionForm>({
    resolver: zodResolver(requestingInstitutionFormSchema),
    defaultValues: {
      name: '',
      type: '',
      agency: '',
      jurisdictionLevel: 'estadual',
    },
  })

  const { mutateAsync: createMutation, isPending: isPendingCreate } =
    useMutation({
      mutationFn: createRequestingInstitution,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['requesting-institutions'] })
      },
      onError: () => {
        toast.error(genericErrorMessage)
      },
    })

  const { mutateAsync: updateMutation, isPending: isPendingUpdate } =
    useMutation({
      mutationFn: updateRequestingInstitution,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['requesting-institutions'] })
      },
      onError: () => {
        toast.error(genericErrorMessage)
      },
    })

  const {
    data: requestingInstitution,
    isLoading: isLoadingRequestingInstitution,
  } = useQuery({
    queryKey: ['requesting-institutions', initialData?.id],
    queryFn: () => getRequestingInstitution({ id: initialData!.id }),
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

  async function onSubmit(props: RequestingInstitutionForm) {
    const normalizedName = normalizeDemandanteName(props.name)
    const existingDemandantes = await getRequestingInstitutions({
      page: 1,
      size: 100,
      search: props.name.trim(),
    })
    const hasDuplicateName = existingDemandantes.data.items.some(
      (item) =>
        item.id !== initialData?.id &&
        normalizeDemandanteName(item.name) === normalizedName,
    )

    if (hasDuplicateName) {
      setError('name', {
        type: 'validate',
        message: 'Já existe um demandante com este nome.',
      })
      return
    }

    if (initialData?.id) {
      await updateMutation({ id: initialData.id, ...props })
      toast.success('Demandante atualizado.')
    } else {
      await createMutation(props)
      toast.success('Demandante criado.')
    }
    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (
      initialData &&
      isOpen &&
      requestingInstitution &&
      !isLoadingRequestingInstitution
    ) {
      setValue('name', requestingInstitution.name)
      setValue('type', requestingInstitution.type)
      setValue('agency', requestingInstitution.agency)
      setValue('jurisdictionLevel', requestingInstitution.jurisdictionLevel)
    }
  }, [
    initialData,
    isOpen,
    requestingInstitution,
    isLoadingRequestingInstitution,
    setValue,
  ])

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen, reset])

  useEffect(() => {
    if (isOpen && !initialData?.id) {
      reset({
        name: '',
        type: '',
        agency: '',
        jurisdictionLevel: 'estadual',
      })
    }
  }, [isOpen, initialData?.id, reset])

  useEffect(() => {
    setIsLoading(
      isLoadingRequestingInstitution ||
        isSubmitting ||
        isPendingCreate ||
        isPendingUpdate,
    )
  }, [
    isLoadingRequestingInstitution,
    isSubmitting,
    isPendingCreate,
    isPendingUpdate,
  ])

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Editar demandante' : 'Novo demandante'}
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="ri-name">Demandante</Label>
              <InputError message={errors.name?.message} />
            </div>
            <Input
              id="ri-name"
              {...register('name')}
              disabled={isLoading}
              placeholder="Ex.: 1ª DP - Praça Mauá"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label>Tipo</Label>
              <InputError message={errors.type?.message} />
            </div>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <SelectWithSearch
                  value={field.value}
                  selectedOption={
                    field.value
                      ? { label: field.value, value: field.value }
                      : undefined
                  }
                  onSelect={(item) => field.onChange(item.value)}
                  placeholder="Selecione ou digite o tipo"
                  disabled={isLoading}
                  creatable
                  enabled={isOpen}
                  queryKey={[
                    'requesting-institutions',
                    'field-options',
                    'type',
                  ]}
                  fetchPage={(args) =>
                    fetchRequestingInstitutionFieldPage('type', args)
                  }
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label>Órgão</Label>
              <InputError message={errors.agency?.message} />
            </div>
            <Controller
              control={control}
              name="agency"
              render={({ field }) => (
                <SelectWithSearch
                  value={field.value}
                  selectedOption={
                    field.value
                      ? { label: field.value, value: field.value }
                      : undefined
                  }
                  onSelect={(item) => field.onChange(item.value)}
                  placeholder="Selecione ou digite o órgão"
                  disabled={isLoading}
                  creatable
                  enabled={isOpen}
                  queryKey={[
                    'requesting-institutions',
                    'field-options',
                    'agency',
                  ]}
                  fetchPage={(args) =>
                    fetchRequestingInstitutionFieldPage('agency', args)
                  }
                />
              )}
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
                  <SelectTrigger id="ri-jurisdiction">
                    <SelectValue placeholder="Selecione a competência" />
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
