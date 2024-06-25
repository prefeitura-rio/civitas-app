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
import { useCarPath } from '@/hooks/useCarPathContext'
import { genericErrorMessage, isValidationError } from '@/utils/error-handlers'
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
    <div>
      <form
        className="flex items-center justify-between"
        onSubmit={handleSubmit(onSubmit)}
      >
        <fieldset className="flex gap-2" disabled={isSubmitting}>
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
        <Button disabled={isSubmitting}>
          <Search />
        </Button>
      </form>
    </div>
  )
}
