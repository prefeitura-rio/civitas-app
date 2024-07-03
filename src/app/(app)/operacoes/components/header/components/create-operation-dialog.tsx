import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InputError } from '@/components/ui/input-error'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createOperation } from '@/http/operations/create-operation'
import { queryClient } from '@/lib/react-query'

const operationFormSchema = z.object({
  title: z.string(),
  description: z.string(),
})

type OperationForm = z.infer<typeof operationFormSchema>

export function OperationDialog() {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OperationForm>({
    resolver: zodResolver(operationFormSchema),
  })

  const { mutateAsync: createOperationMutation } = useMutation({
    mutationFn: createOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] })
    },
  })

  function onSubmit(props: OperationForm) {
    createOperationMutation({
      title: props.title,
      description: props.description,
    })
    onClose()
  }

  function onClose() {
    setOpen(false)
    reset()
  }

  function handleOnOpenChange(isOpen: boolean) {
    if (isOpen) {
      setOpen(true)
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOnOpenChange}>
      <DialogTrigger asChild>
        <Button variant="link" type="button" className="h-1 p-0 text-xs">
          Criar operação
        </Button>
      </DialogTrigger>
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
