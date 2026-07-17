'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { InputError } from '@/components/custom/input-error'
import { SelectWithSearch } from '@/components/custom/select-with-search'
import { Spinner } from '@/components/custom/spinner'
import { PhoneInput } from '@/components/reui/phone-input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  type InstitutionAuthorityForm,
  institutionAuthorityFormSchema,
} from '@/contexts/institution-authorities-context'
import { useInstitutionAuthorities } from '@/hooks/useContexts/use-institution-authorities-context'
import {
  createInstitutionAuthority,
  getInstitutionAuthority,
  replaceInstitutionAuthorityContacts,
  updateInstitutionAuthority,
} from '@/http/institution-authorities'
import { getRequestingInstitutions } from '@/http/requesting-institutions'
import { queryClient } from '@/lib/react-query'
import { getApiErrorMessage } from '@/utils/error-handlers'

interface InstitutionAuthorityFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

function ensureSinglePrimary<T extends { isPrimary: boolean }>(items: T[]) {
  if (items.length === 0) return items
  if (items.some((item) => item.isPrimary)) return items

  return items.map((item, index) => ({
    ...item,
    isPrimary: index === 0,
  }))
}

const emptyFormValues: InstitutionAuthorityForm = {
  requestingInstitutionId: '',
  name: '',
  isFocalPoint: false,
  phones: [],
  emails: [],
}

export function InstitutionAuthorityFormDialog({
  isOpen,
  onClose,
  onOpen,
}: InstitutionAuthorityFormDialogProps) {
  const {
    dialogInitialData: initialData,
    setDialogInitialData: setInitialData,
  } = useInstitutionAuthorities()

  const form = useForm<InstitutionAuthorityForm>({
    resolver: zodResolver(institutionAuthorityFormSchema),
    defaultValues: emptyFormValues,
  })

  const { register, control, handleSubmit, reset, setValue, formState } = form
  const { errors, isSubmitting } = formState

  const phonesFieldArray = useFieldArray({
    control,
    name: 'phones',
  })

  const emailsFieldArray = useFieldArray({
    control,
    name: 'emails',
  })

  const {
    data: requestingInstitutionsResponse,
    isLoading: isLoadingRequesters,
  } = useQuery({
    queryKey: ['requesting-institutions', 'options', 100],
    queryFn: () => getRequestingInstitutions({ page: 1, size: 100 }),
    enabled: isOpen,
  })

  const { data: authority, isLoading: isLoadingAuthority } = useQuery({
    queryKey: ['institution-authorities', initialData?.id],
    queryFn: () => getInstitutionAuthority({ id: initialData!.id }),
    enabled: Boolean(initialData?.id && isOpen),
  })

  const { mutateAsync: createMutation, isPending: isPendingCreate } =
    useMutation({
      mutationFn: createInstitutionAuthority,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['institution-authorities'] })
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
      },
    })

  const { mutateAsync: updateMutation, isPending: isPendingUpdate } =
    useMutation({
      mutationFn: updateInstitutionAuthority,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['institution-authorities'] })
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
      },
    })

  const { mutateAsync: replaceContactsMutation, isPending: isPendingContacts } =
    useMutation({
      mutationFn: replaceInstitutionAuthorityContacts,
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
      },
    })

  const requestingInstitutionOptions = useMemo(
    () =>
      (requestingInstitutionsResponse?.data.items ?? []).map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [requestingInstitutionsResponse?.data.items],
  )

  function handleOnOpenChange(open: boolean) {
    if (open) {
      onOpen()
      return
    }

    onClose()
    reset(emptyFormValues)
    setInitialData(null)
  }

  async function onSubmit(values: InstitutionAuthorityForm) {
    const phones = ensureSinglePrimary(
      values.phones
        .map((item) => ({
          phone: item.phone.trim(),
          isPrimary: item.isPrimary,
        }))
        .filter((item) => item.phone.length > 0),
    )

    const emails = ensureSinglePrimary(
      values.emails
        .map((item) => ({
          email: item.email.trim(),
          isPrimary: item.isPrimary,
        }))
        .filter((item) => item.email.length > 0),
    )

    const hasAnyContacts = phones.length > 0 || emails.length > 0

    if (initialData?.id) {
      await updateMutation({
        id: initialData.id,
        name: values.name.trim(),
        requestingInstitutionId: values.requestingInstitutionId,
        isFocalPoint: values.isFocalPoint,
      })

      if (hasAnyContacts) {
        await replaceContactsMutation({
          id: initialData.id,
          phones,
          emails,
        })
      }

      toast.success('Requisitante atualizada.')
    } else {
      const createdAuthority = await createMutation({
        name: values.name.trim(),
        requestingInstitutionId: values.requestingInstitutionId,
        isFocalPoint: values.isFocalPoint,
      })

      if (hasAnyContacts) {
        await replaceContactsMutation({
          id: createdAuthority.id,
          phones,
          emails,
        })
      }

      toast.success('Requisitante criado.')
    }

    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (!isOpen) return

    if (initialData?.id && authority) {
      reset({
        requestingInstitutionId: authority.requestingInstitutionId,
        name: authority.name,
        isFocalPoint: authority.isFocalPoint,
        phones: authority.contacts?.phones ?? [],
        emails: authority.contacts?.emails ?? [],
      })
      return
    }

    if (!initialData?.id) {
      reset(emptyFormValues)
    }
  }, [authority, initialData?.id, isOpen, reset])

  const isLoading =
    isLoadingAuthority ||
    isLoadingRequesters ||
    isSubmitting ||
    isPendingCreate ||
    isPendingUpdate ||
    isPendingContacts

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Editar requisitante' : 'Novo requisitante'}
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label>Demandante</Label>
              <InputError message={errors.requestingInstitutionId?.message} />
            </div>
            <Controller
              control={control}
              name="requestingInstitutionId"
              render={({ field }) => {
                const selected = requestingInstitutionOptions.find(
                  (option) => option.value === field.value,
                )

                return (
                  <SelectWithSearch
                    disabled={isLoading}
                    value={selected?.label ?? ''}
                    placeholder="Selecione o demandante"
                    options={requestingInstitutionOptions}
                    onSelect={(item) =>
                      setValue('requestingInstitutionId', item.value, {
                        shouldValidate: true,
                      })
                    }
                  />
                )
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="ia-name">Requisitante</Label>
              <InputError message={errors.name?.message} />
            </div>
            <Input
              id="ia-name"
              {...register('name')}
              disabled={isLoading}
              placeholder="Ex.: Delegado responsável"
            />
          </div>

          <Controller
            control={control}
            name="isFocalPoint"
            render={({ field }) => (
              <label className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(value) => field.onChange(Boolean(value))}
                  disabled={isLoading}
                />
                <span className="text-sm">Marcar como ponto focal</span>
              </label>
            )}
          />

          <div className="flex flex-col gap-3 rounded-md border p-4">
            <div className="flex items-center justify-between gap-2">
              <Label>Telefones</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() =>
                  phonesFieldArray.append({ phone: '', isPrimary: false })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar telefone
              </Button>
            </div>

            {phonesFieldArray.fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum telefone cadastrado.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {phonesFieldArray.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_auto_auto]"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2">
                        <Label htmlFor={`phones.${index}.phone`}>
                          Telefone
                        </Label>
                        <InputError
                          message={errors.phones?.[index]?.phone?.message}
                        />
                      </div>
                      <Controller
                        control={control}
                        name={`phones.${index}.phone`}
                        render={({ field: phoneField }) => (
                          <PhoneInput
                            id={`phones.${index}.phone`}
                            value={phoneField.value}
                            onChange={(value) =>
                              phoneField.onChange(value ?? '')
                            }
                            onBlur={phoneField.onBlur}
                            name={phoneField.name}
                            ref={phoneField.ref}
                            disabled={isLoading}
                            placeholder="(21) 99999-9999"
                          />
                        )}
                      />
                    </div>

                    <Controller
                      control={control}
                      name={`phones.${index}.isPrimary`}
                      render={({ field: checkboxField }) => (
                        <label className="flex items-center gap-2 self-end pb-2 text-sm">
                          <Checkbox
                            checked={checkboxField.value}
                            onCheckedChange={(value) =>
                              checkboxField.onChange(Boolean(value))
                            }
                            disabled={isLoading}
                          />
                          Principal
                        </label>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isLoading}
                      className="self-end text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => phonesFieldArray.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-md border p-4">
            <div className="flex items-center justify-between gap-2">
              <Label>E-mails</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() =>
                  emailsFieldArray.append({ email: '', isPrimary: false })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar e-mail
              </Button>
            </div>

            {emailsFieldArray.fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum e-mail cadastrado.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {emailsFieldArray.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_auto_auto]"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2">
                        <Label htmlFor={`emails.${index}.email`}>E-mail</Label>
                        <InputError
                          message={errors.emails?.[index]?.email?.message}
                        />
                      </div>
                      <Input
                        id={`emails.${index}.email`}
                        type="email"
                        {...register(`emails.${index}.email`)}
                        disabled={isLoading}
                        placeholder="Ex.: contato@orgao.rj.gov.br"
                      />
                    </div>

                    <Controller
                      control={control}
                      name={`emails.${index}.isPrimary`}
                      render={({ field: checkboxField }) => (
                        <label className="flex items-center gap-2 self-end pb-2 text-sm">
                          <Checkbox
                            checked={checkboxField.value}
                            onCheckedChange={(value) =>
                              checkboxField.onChange(Boolean(value))
                            }
                            disabled={isLoading}
                          />
                          Principal
                        </label>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isLoading}
                      className="self-end text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => emailsFieldArray.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-2 flex w-full justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
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
