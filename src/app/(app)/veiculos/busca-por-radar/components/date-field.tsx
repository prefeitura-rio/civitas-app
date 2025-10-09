import { Info } from 'lucide-react'
import { Controller } from 'react-hook-form'

import { Tooltip } from '@/components/custom/tooltip'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'

interface DateFieldProps {
  name: 'startDate' | 'endDate'
  control: any // eslint-disable-line @typescript-eslint/no-explicit-any
  isSubmitting: boolean
  errors: any // eslint-disable-line @typescript-eslint/no-explicit-any
  minDate: Date
  maxDate: Date
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
    <div className="relative flex w-full flex-col">
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
        <div className="absolute-y-centered right-2 flex items-center">
          <Tooltip
            side="bottom"
            render={
              <Card className="m-0">
                <p>O intervalo entre as datas deve ser de no máximo 5 horas</p>
              </Card>
            }
          >
            <Info className="size-4 text-muted-foreground" />
          </Tooltip>
        </div>
      )}
      {errors[name] && (
        <span className="mt-1 text-sm text-red-500">
          {errors[name]?.message}
        </span>
      )}
    </div>
  )
}
