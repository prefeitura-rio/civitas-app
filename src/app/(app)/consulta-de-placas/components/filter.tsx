'use client'
import { Search } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { InputError } from '@/components/ui/input-error'
import { Label } from '@/components/ui/label'
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCarPath } from '@/hooks/useCarPathContext'
import { genericErrorMessage } from '@/utils/error-handlers'
import { formatDateUTC } from '@/utils/formatDateUTC'

export const filterFormSchema = z.object({
  plateNumer: z.string().min(1, { message: 'Campo obrigatório' }),
  startTime: z.date({ message: 'Campo obrigatório' }),
  endTime: z.date({ message: 'Campo obrigatório' }),
})

export type FilterForm = z.infer<typeof filterFormSchema>

export function Filter() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormContext<FilterForm>()
  const { getCarPath } = useCarPath()

  async function onSubmit(props: FilterForm) {
    try {
      await getCarPath({
        placa: props.plateNumer,
        startTime: formatDateUTC(props.startTime),
        endTime: formatDateUTC(props.endTime),
      })
    } catch (error) {
      toast.error(genericErrorMessage)
    }
  }

  return (
    <SheetContent className="flex flex-col gap-8">
      <SheetHeader>
        <SheetTitle>Consultar placa</SheetTitle>
        <SheetDescription>
          Pesquise por uma placa em uma janela de tempo para ver no mapa os
          lugares por onde ela foi avistada e suas rotas aparentes.
        </SheetDescription>
      </SheetHeader>
      <form
        className="flex h-full flex-col justify-between"
        onSubmit={handleSubmit(onSubmit)}
      >
        <fieldset className="flex flex-col gap-2" disabled={isSubmitting}>
          <div className="flex flex-col gap-1">
            <Label htmlFor="plateNumber">Número da placa</Label>
            <Input
              id="plateNumber"
              // placeholder="LSY7A9D"
              type="text"
              {...register('plateNumer')}
            />
            <InputError message={errors.plateNumer?.message} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="startTime">Data de início do intervalo</Label>
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <DateTimePicker
                  granularity="minute"
                  jsDate={field.value}
                  onJsDateChange={field.onChange}
                />
              )}
              disabled={isSubmitting}
            />
            <InputError message={errors.startTime?.message} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="endTime">Data de término do intervalo</Label>
            <Controller
              control={control}
              name="endTime"
              render={({ field }) => (
                <DateTimePicker
                  granularity="minute"
                  jsDate={field.value}
                  onJsDateChange={field.onChange}
                />
              )}
              disabled={isSubmitting}
            />
            <InputError message={errors.endTime?.message} />
          </div>
        </fieldset>
        <Button disabled={isSubmitting} className="flex gap-2">
          <Search />
          Pesquisar
        </Button>
      </form>
    </SheetContent>
  )
}
