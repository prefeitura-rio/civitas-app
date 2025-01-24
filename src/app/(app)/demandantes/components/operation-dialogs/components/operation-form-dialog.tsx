'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import {
  type OperationForm,
  operationFormSchema,
} from '@/contexts/operations-context'
import { useOperations } from '@/hooks/use-contexts/use-operations-context'
import { createOperation } from '@/http/operations/create-operation'
import { getOperation } from '@/http/operations/get-operation'
import { updateOperation } from '@/http/operations/update-operation'
import { queryClient } from '@/lib/react-query'
import {
  GENERIC_ERROR_MESSAGE,
  isConflictError,
} from '@/utils/others/error-handlers'

interface OperationDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function OperationFormDialog({
  isOpen,
  onClose,
  onOpen,
}: OperationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    dialogInitialData: initialData,
    setDialogInitialData: setInitialData,
  } = useOperations()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OperationForm>({
    resolver: zodResolver(operationFormSchema),
  })

  const { mutateAsync: createOperationMutation, isPending: isPendingCreate } =
    useMutation({
      mutationFn: createOperation,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['operations'],
        })
      },
      onError: (error, variables) => {
        if (isConflictError(error) || error.message.includes('409')) {
          toast.error(`O demandante ${variables.title} já existe`)
        } else {
          toast.error(GENERIC_ERROR_MESSAGE)
        }
      },
    })

  const { mutateAsync: updateOperationMutation, isPending: isPendingUpdate } =
    useMutation({
      mutationFn: updateOperation,
      onSuccess: ({ title }) => {
        queryClient.invalidateQueries({
          queryKey: ['operations'],
        })
        toast.success(`Demandante ${title} criado com sucesso.`)
      },
      onError: () => {
        toast.error(GENERIC_ERROR_MESSAGE)
      },
    })

  const { data: operation, isLoading: isLoadingOperation } = useQuery({
    queryKey: [`operations/${initialData?.id}`],
    queryFn: () => (initialData ? getOperation({ id: initialData?.id }) : null),
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

  async function onSubmit(props: OperationForm) {
    if (initialData?.id) {
      await updateOperationMutation({
        id: initialData.id,
        title: props.title,
        description: props.description,
      })
    } else {
      await createOperationMutation({
        title: props.title,
        description: props.description,
      })
    }
    handleOnOpenChange(false)
  }

  useEffect(() => {
    if (initialData && isOpen && !isLoading && operation) {
      setValue('title', operation.title)
      setValue('description', operation.description)
      setIsLoading(false)
    }
  }, [isOpen, isLoading, operation])

  useEffect(() => {
    if (
      isLoadingOperation ||
      isSubmitting ||
      isPendingCreate ||
      isPendingUpdate
    ) {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [isSubmitting, isPendingCreate, isPendingUpdate, isLoadingOperation])

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Demandante</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="title">Nome</Label>
              <InputError message={errors.title?.message} />
            </div>
            <Input
              id="title"
              {...register('title')}
              type="text"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="description">Descrição</Label>
              <InputError message={errors.description?.message} />
            </div>
            <Textarea
              id="description"
              {...register('description')}
              disabled={isLoading}
            />
          </div>

          <div className="mt-4 flex w-full justify-end">
            <Button type="submit" disabled={isLoading}>
              {isPendingCreate || isPendingUpdate ? (
                <Spinner />
              ) : (
                <span>Criar</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
