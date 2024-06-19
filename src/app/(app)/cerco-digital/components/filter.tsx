'use client'
import { format } from 'date-fns'
import { Controller, useFormContext } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
// import { DatePicker } from '@/components/ui/date-picker'
// import { DateTimePicker } from '@/components/ui/date-time-picker/date-time-picker'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const filterFormSchema = z.object({
  plateNumer: z.string().min(1, { message: 'Campo obrigatório' }),
  dateStart: z.date(),
  dateEnd: z.date(),
})

export type FilterForm = z.infer<typeof filterFormSchema>

export function Filter() {
  const { watch, control, register, handleSubmit } =
    useFormContext<FilterForm>()

  function onSubmit(props: FilterForm) {
    // ...
    console.log(props)
  }

  console.log({
    1: watch('plateNumer'),
    2: watch('dateStart'),
    3: watch('dateEnd'),
  })
  if (watch('dateStart')) {
    const newDate = new Date(watch('dateStart'))
    const hours = newDate.getHours()
    console.log({
      dateStart: format(
        new Date(watch('dateStart')).setHours(hours + 3),
        "yyyy-MM-dd'T'HH:mm:ss",
      ),
    })
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
            <Label htmlFor="dateStart">Data de início do intervalo</Label>
            <Controller
              control={control}
              name="dateStart"
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
            <Label htmlFor="dateEnd">Data de término do intervalo</Label>
            <Controller
              control={control}
              name="dateEnd"
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
