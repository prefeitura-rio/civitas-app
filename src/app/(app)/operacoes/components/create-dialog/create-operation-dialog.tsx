'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
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
import { Textarea } from '@/components/ui/textarea'
import {
  type CreateOperationForm,
  createOperationFormSchema,
} from '@/contexts/operations-context'
import { useOperations } from '@/hooks/use-operations'
import { createOperation } from '@/http/operations/create-operation'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

export function CreateOperationDialog() {
  const { createDialogDisclosure } = useOperations()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOperationForm>({
    resolver: zodResolver(createOperationFormSchema),
  })

  const { mutateAsync: createOperationMutation } = useMutation({
    mutationFn: createOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] })
    },
    onError: () => {
      toast.error(genericErrorMessage)
    },
  })

  async function onSubmit(props: CreateOperationForm) {
    await createOperationMutation({
      title: props.title,
      description: props.description,
    })
    reset()
    createDialogDisclosure.onClose()
  }

  return (
    <Dialog
      open={createDialogDisclosure.isOpen}
      onOpenChange={createDialogDisclosure.onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Operação</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="title">Título</Label>
              <InputError message={errors.title?.message} />
            </div>
            <Input id="title" {...register('title')} type="text" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="description">Descrição</Label>
              <InputError message={errors.title?.message} />
            </div>
            <Textarea id="description" {...register('description')} />
          </div>

          <div className="mt-4 flex w-full justify-end">
            <Button type="submit">Criar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
