'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InputError } from '@/components/ui/input-error'
import { Label } from '@/components/ui/label'
import { updateMonitoredPlate } from '@/http/cars/update-monitored-plate'

const newPlateFormSchema = z.object({
  plate: z.string().min(1, { message: 'Campo obrigatório' }),
  notificationChannels: z.array(
    z.object({
      channel: z.string(),
    }),
  ),
})

type NewPlateForm = z.infer<typeof newPlateFormSchema>

interface UpdateMonitoredPlateDialogProps {
  plate: string
  additionalInfo?: string
  notificationChannels?: string[]
}
export function UpdateMonitoredPlateDialog({
  plate,
  additionalInfo,
  notificationChannels,
}: UpdateMonitoredPlateDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewPlateForm>({
    resolver: zodResolver(newPlateFormSchema),
    defaultValues: {
      plate,
      notificationChannels: [{ channel: '' }],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'notificationChannels',
  })

  console.log({ plate })

  function onSubmit(props: NewPlateForm) {
    const notificationChannels = props.notificationChannels.map(
      (item) => item.channel,
    )

    const response = updateMonitoredPlate({
      plate: props.plate,
      notificationChannels,
    })

    toast.promise(response, {
      loading: 'Criando registro...',
      error:
        'Não foi possível criar o registro. Se o erro persistir, por favor, contate um administrador do sistema.',
      success: 'Registro criado com sucesso.',
    })
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Adicionar nova placa</DialogTitle>
        <DialogDescription>
          Ao cadastrar essa placa, ela será monitorada pelo sistema de câmeras
          da cidade. Sempre que a placa for avistada, um alerta será emitido no
          sistema.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Label htmlFor="plate">Número da placa</Label>
            <InputError message={errors.plate?.message} />
          </div>
          <Input id="plate" type="text" {...register('plate')} disabled />
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Label>Canais de notificação</Label>
              <Button
                variant="secondary"
                type="button"
                className="h-8 w-8 p-0"
                onClick={() => append({ channel: '' })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div className="flex items-center gap-2">
                  <Input
                    {...register(`notificationChannels.${index}.channel`)}
                  />
                  <Button
                    variant="destructive"
                    className="h-8 w-8 p-0"
                    onClick={() => remove(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-end">
          <Button type="submit">Adicionar</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
