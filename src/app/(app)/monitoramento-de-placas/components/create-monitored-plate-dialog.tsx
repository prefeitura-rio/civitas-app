'use client'
import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox-with-create'
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
import { Tooltip } from '@/components/ui/tooltip'
import { createMonitoredPlate } from '@/http/cars/create-monitored-plate'
import { getNotificationChannel } from '@/http/notification-channels/get-notification-channel'
import { isApiError } from '@/lib/api'
import { genericErrorMessage } from '@/utils/error-handlers'

export const newPlateFormSchema = z.object({
  plate: z
    .string()
    .min(1, { message: 'Campo obrigatório' })
    .regex(/^[A-Z]{3}\d[A-Z\d]\d{2}$/, 'Formato inválido')
    .transform((item) => item.toUpperCase()),
  operation: z.string().min(1, { message: 'Campo obrigatório' }),
})

export type NewPlateForm = z.infer<typeof newPlateFormSchema>

interface CreateMonitoredPlateDialogProps {
  operations: string[]
}

export function CreateMonitoredPlateDialog({
  operations,
}: CreateMonitoredPlateDialogProps) {
  const [comboboxOptions, setComboboxOptions] = useState<string[]>(operations)
  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    setValue,
  } = useFormContext<NewPlateForm>()

  async function onSubmit(props: NewPlateForm) {
    try {
      const channelsResponse = await getNotificationChannel({})
      const channel = channelsResponse.data.items.at(0)?.id || ''

      const response = createMonitoredPlate({
        plate: props.plate,
        additionalInfo: JSON.parse(`{"Operação":"${props.operation}"}`),
        notificationChannels: [channel],
      })

      toast.promise(response, {
        loading: 'Criando registro...',
        error(error) {
          if (isApiError(error)) {
            if (error.response?.status === 409) {
              return 'Essa placa já existe!'
            }
          }

          return genericErrorMessage
        },
        success: 'Registro criado com sucesso.',
      })
    } catch (error) {
      toast.error(genericErrorMessage)
    }
  }

  useEffect(() => {
    setComboboxOptions(operations)
  }, [operations])

  return (
    <DialogContent
      onOpenAutoFocus={(e) => {
        e.preventDefault() // Para que o tooltip da placa não seja ativado automativamente ao abrir o dialog.
      }}
    >
      <DialogHeader>
        <DialogTitle>Adicionar placa</DialogTitle>
        <DialogDescription>
          Cadastre a placa do veículo que precisa ser monitorada. Quando uma
          câmera da cidade detectar essa placa, um alerta será enviado
          automaticamente para o canal do Discord.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="plate">Número da placa</Label>
              <Tooltip text="A placa deve ter exatamente 7 caracteres: os 3 primeiros devem ser letras, o 4º caractere deve ser um dígito, o 5º caractere pode ser uma letra ou um dígito, e os 2 últimos caracteres devem ser dígitos.">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Tooltip>
              <InputError message={errors.plate?.message} />
            </div>
            <Input
              id="plate"
              type="text"
              {...register('plate')}
              onChange={(e) => setValue('plate', e.target.value.toUpperCase())}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Label htmlFor="plate">Operação</Label>
              <InputError message={errors.operation?.message} />
            </div>
            <Controller
              control={control}
              name="operation"
              render={({ field }) => (
                <Combobox
                  mode="single"
                  options={comboboxOptions.map((item) => {
                    return {
                      value: item,
                      label: item,
                    }
                  })}
                  placeholder="Selecione uma operação ou crie uma nova..."
                  selected={field.value} // string or array
                  onChange={(newValue) =>
                    setValue('operation', String(newValue))
                  }
                  onCreate={(value) => {
                    setComboboxOptions([...comboboxOptions, value])
                  }}
                />
              )}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-end">
          <Button type="submit">Adicionar</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
