'use client'
import { Controller, useFormContext } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCarPath } from '@/hooks/useCarPathContext'
import { formatDateUTC } from '@/utils/formatDateUTC'
import { handleToastErrorMessage } from '@/utils/handleToastErrorMessage'

export const filterFormSchema = z.object({
  plateNumer: z.string().min(1, { message: 'Campo obrigatório' }),
  startTime: z.date(),
  endTime: z.date(),
})

export type FilterForm = z.infer<typeof filterFormSchema>

export function Filter() {
  const { control, register, handleSubmit } = useFormContext<FilterForm>()
  const { getCarPath } = useCarPath()

  async function onSubmit(props: FilterForm) {
    try {
      await getCarPath({
        placa: props.plateNumer,
        startTime: formatDateUTC(props.startTime),
        endTime: formatDateUTC(props.endTime),
      })
    } catch (error) {
      handleToastErrorMessage(error)
    }
  }

  return (
    <div>
      <form className="flex justify-between" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="plateNumber">Número da placa</Label>
            <Input
              id="plateNumber"
              // placeholder="LSY7A9D"
              type="text"
              {...register('plateNumer')}
            />
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
            />
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
            />
          </div>
        </div>
        <Button>
          <span className="text-lg font-semibold">Pesquisar</span>
        </Button>
      </form>
    </div>
  )
}
