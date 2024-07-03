'use client'
import { useMutation } from '@tanstack/react-query'
import { Info, Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
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
import { Tooltip } from '@/components/ui/tooltip'
import { createMonitoredPlate } from '@/http/cars/monitored/create-monitored-plate'
import { getNotificationChannels } from '@/http/notification-channels/get-notification-channels'
import { isApiError } from '@/lib/api'
import { queryClient } from '@/lib/react-query'
import { genericErrorMessage } from '@/utils/error-handlers'

import { OperationCombobox } from './monitored-plate-dialogs/operation/operation-combobox'

export const newPlateFormSchema = z.object({
  plate: z
    .string()
    .min(1, { message: 'Campo obrigatório' })
    .regex(/^[A-Z]{3}\d[A-Z\d]\d{2}$/, 'Formato inválido')
    .transform((item) => item.toUpperCase()),
  operation: z.string().min(1, { message: 'Campo obrigatório' }),
  notificationChannels: z.array(
    z.object({
      channel: z.string().min(1, { message: 'Esse campo não pode ser vazio.' }),
      id: z.string().min(1),
    }),
  ),
})

export type NewPlateForm = z.infer<typeof newPlateFormSchema>

export function CreateMonitoredPlateDialog() {
  const [operationId, setOperationId] = useState('')

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    setValue,
  } = useFormContext<NewPlateForm>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'notificationChannels',
  })

  const { mutateAsync: createMonitoredPlateMutation } = useMutation({
    mutationFn: createMonitoredPlate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars/monitored'] })
    },
  })

  async function onSubmit(props: NewPlateForm) {
    try {
      const channelsResponse = await getNotificationChannels({})
      const channel = channelsResponse.data.items.at(0)?.id || ''

      const response = createMonitoredPlateMutation({
        plate: props.plate,
        operationId,
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
          câmera da cidade detectá-la, um alerta será enviado automaticamente
          para o canal do Discord especificado.
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
            <OperationCombobox setOperationId={setOperationId} />
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
                  <div key={index}>
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
                    <InputError
                      message={
                        errors.notificationChannels?.[index]?.channel?.message
                      }
                    />
                  </div>
                ))}
              </div>
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
