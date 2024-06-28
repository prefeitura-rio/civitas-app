'use client'
import { Search } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { InputError } from '@/components/ui/input-error'
import { Label } from '@/components/ui/label'
import { useCarPath } from '@/hooks/useCarPathContext'
import { genericErrorMessage } from '@/utils/error-handlers'
import { formatDateUTC } from '@/utils/formatDateUTC'

export const filterFormSchema = z.object({
  plateNumer: z.string().min(1, { message: 'Campo obrigatório' }),
  startTime: z.date({ message: 'Campo obrigatório' }),
  endTime: z.date({ message: 'Campo obrigatório' }),
})

export type FilterForm = z.infer<typeof filterFormSchema>

export function FilterForm() {
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
    <div className="flex flex-col">
      <form className="flex h-full flex-col" onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Consultar placa</CardTitle>
            <Button disabled={isSubmitting} className="flex gap-2">
              <Search />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <fieldset className="flex flex-col gap-1" disabled={isSubmitting}>
            <div className="flex flex-col gap-1">
              <div className="space-x-2">
                <Label htmlFor="plateNumber">Número da placa</Label>
                <InputError message={errors.plateNumer?.message} />
              </div>
              <Input
                id="plateNumber"
                // placeholder="LSY7A9D"
                type="text"
                {...register('plateNumer')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="space-x-2">
                <Label htmlFor="startTime">Data de início do intervalo</Label>
                <InputError message={errors.startTime?.message} />
              </div>
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
            </div>
            <div className="flex flex-col gap-1">
              <div className="space-x-2">
                <Label htmlFor="endTime">Data de término do intervalo</Label>
                <InputError message={errors.endTime?.message} />
              </div>
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
            </div>
          </fieldset>
        </CardContent>
      </form>
    </div>
  )
}
