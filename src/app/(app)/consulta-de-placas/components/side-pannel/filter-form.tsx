'use client'
import { format } from 'date-fns'
import { Search } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Input } from '@/components/ui/input'
import { InputError } from '@/components/ui/input-error'
import { Label } from '@/components/ui/label'
import { useCarPath } from '@/hooks/use-contexts/use-car-path-context'
import { genericErrorMessage } from '@/utils/error-handlers'

export const filterFormSchema = z.object({
  plate: z
    .string()
    .min(1, { message: 'Campo obrigatório' })
    .toUpperCase()
    .regex(/^[A-Z]{3}\d[A-Z\d]\d{2}$/, 'Formato inválido'),
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

export function FilterForm() {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors, isSubmitting },
  } = useFormContext<FilterForm>()
  const { getCarPath } = useCarPath()

  async function onSubmit(props: FilterForm) {
    try {
      await getCarPath({
        placa: props.plate,
        startTime: format(props.date.from, "yyyy-MM-dd'T'HH:mm:59.999"),
        endTime: format(props.date.to, "yyyy-MM-dd'T'HH:mm:ss"),
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
          <fieldset className="space-y-2" disabled={isSubmitting}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="plateNumber">Placa:</Label>
                <InputError message={errors.plate?.message} />
              </div>
              <Input
                id="plateNumber"
                type="text"
                {...register('plate')}
                onChange={(e) =>
                  setValue('plate', e.target.value.toUpperCase())
                }
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
        </CardContent>
      </form>
    </div>
  )
}
