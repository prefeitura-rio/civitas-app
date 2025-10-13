import { Info } from 'lucide-react'
import { Controller } from 'react-hook-form'

import { InputError } from '@/components/custom/input-error'
import { Tooltip } from '@/components/custom/tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'

interface DateFieldProps {
  name: 'startDate' | 'endDate'
  control: any // eslint-disable-line @typescript-eslint/no-explicit-any
  isSubmitting: boolean
  errors: any // eslint-disable-line @typescript-eslint/no-explicit-any
  minDate: Date
  maxDate: Date
}

function CardTooltipContent() {
  return (
    <Card className="m-0">
      <CardHeader>
        <CardTitle className="text-center">
          Instruções para seleção de datas:
        </CardTitle>
      </CardHeader>
      <CardContent className="text-start">
        <p>O intervalo entre as datas deve ser de no máximo 5 horas</p>
      </CardContent>
    </Card>
  )
}

export function DateField({
  name,
  control,
  isSubmitting,
  errors,
  minDate,
  maxDate,
}: DateFieldProps) {
  const isEndDate = name === 'endDate'

  return (
    <div className="flex w-full flex-col">
      <div className="relative w-full">
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <DatePicker
              className="w-full"
              value={field.value}
              onChange={field.onChange}
              type="datetime-local"
              disabled={isSubmitting}
              fromDate={minDate}
              toDate={maxDate}
            />
          )}
        />
        {isEndDate && (
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
            <Tooltip side="bottom" render={<CardTooltipContent />}>
              <Info className="size-4 text-muted-foreground" />
            </Tooltip>
          </div>
        )}
      </div>
      {errors[name] && <InputError message={errors[name]?.message} />}
    </div>
  )
}
