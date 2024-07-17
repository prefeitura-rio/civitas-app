'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CarFront, Info, Search } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Input } from '@/components/ui/input'
import { InputError } from '@/components/ui/input-error'
import { Label } from '@/components/ui/label'
import { Tooltip } from '@/components/ui/tooltip'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'
import { dateToString } from '@/utils/date-to-string'
import { genericErrorMessage } from '@/utils/error-handlers'

import { PlateWildcardsHelperInfo } from './plate-wildcards-helper-info'

export const filterFormSchema = z.object({
  plate: z
    .string()
    .min(1, { message: 'Campo obrigatório' })
    .toUpperCase()
    .refine(
      (val) => {
        // If the value contains a wildcard character, it's valid
        if (val.includes('*')) {
          return true
        }
        // Otherwise, it must match the regex pattern
        return /^[A-Z]{3}\d[A-Z\d]\d{2}$/.test(val)
      },
      { message: 'Formato inválido' },
    ),
  date: z
    .object(
      {
        from: z.date({ message: 'Campo obrigatório' }),
        to: z.date({ message: 'Selecione uma data de término' }),
      },
      { message: 'Campo obrigatório' },
    )
    .superRefine((val, ctx) => {
      if (val.to > new Date()) {
        ctx.addIssue({
          code: 'invalid_date',
          message: 'A data de término deve ser menor ou igual à data atual',
        })
      }
    }),
})

export type FilterForm = z.infer<typeof filterFormSchema>

export function SearchByPlateFilterForm() {
  const { getCarPath, getCarHint } = useCarPath()
  const today = new Date()
  const from = new Date()
  from.setDate(today.getDate() - 7)
  from.setHours(0)
  from.setMinutes(0)

  const {
    control,
    register,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<FilterForm>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      date: {
        from,
        to: today,
      },
    },
  })

  async function onSubmit(props: FilterForm) {
    try {
      if (props.plate.includes('*')) {
        await getCarHint({
          plate: props.plate,
          startTime: dateToString(props.date.from),
          endTime: dateToString(props.date.to),
          minLat: -90,
          maxLat: 90,
          minLon: -180,
          maxLon: 180,
        })
      } else {
        await getCarPath({
          placa: props.plate,
          startTime: format(props.date.from, "yyyy-MM-dd'T'HH:mm"),
          endTime: format(props.date.to, "yyyy-MM-dd'T'HH:mm:ss"),
        })
      }
    } catch (error) {
      toast.error(genericErrorMessage)
    }
  }

  return (
    <div className="flex flex-col">
      <form className="flex h-full flex-col" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between py-2">
          <CardTitle className="flex items-center gap-2">
            Consultar placa
            <CarFront className="h-8 w-8" />
          </CardTitle>
          <Button disabled={isSubmitting} className="flex h-9 w-9 gap-2 p-2">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <fieldset className="space-y-2" disabled={isSubmitting}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label>Placa:</Label>
              <Tooltip
                asChild
                render={<PlateWildcardsHelperInfo />}
                className="p-0"
              >
                <Info className="h-4 w-4 text-muted-foreground" />
              </Tooltip>
              <InputError message={errors.plate?.message} />
            </div>
            <Input
              id="plateNumber"
              type="text"
              className=""
              {...register('plate')}
              onChange={(e) => setValue('plate', e.target.value.toUpperCase())}
            />
          </div>
          <Controller
            control={control}
            name="date"
            render={({ field }) => {
              return (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="endTime">Data:</Label>
                    <InputError
                      className="whitespace-nowrap"
                      message={
                        errors.date?.message ||
                        errors.date?.from?.message ||
                        errors.date?.to?.message
                      }
                    />
                  </div>
                  <DatePickerWithRange
                    placeholder="Selecione uma data"
                    onChangeValue={(e) => {
                      field.onChange(e)
                      if (e) {
                        if (e.from) setValue('date.from', e.from)
                        if (e.to) setValue('date.to', e.to)
                      } else {
                        resetField('date.from')
                        resetField('date.to')
                      }
                    }}
                    value={field.value}
                    defaultValue={field.value}
                    defaultMonth={new Date().getMonth() - 1}
                  />
                </div>
              )
            }}
          />
        </fieldset>
      </form>
    </div>
  )
}
