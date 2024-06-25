'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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

const newPlateFormSchema = z.object({
  plate: z.string().min(1, { message: 'Campo obrigatório' }),
})

type NewPlateForm = z.infer<typeof newPlateFormSchema>

export function CreateMonitoredPlateDialog() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPlateForm>({
    resolver: zodResolver(newPlateFormSchema),
  })

  function onSubmit(props: NewPlateForm) {
    // ...
    console.log(props)
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
          <Input id="plate" type="text" {...register('plate')} />
        </div>
        <DialogFooter className="flex justify-end">
          <Button type="submit">Adicionar</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
