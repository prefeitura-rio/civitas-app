import { HelpCircle } from 'lucide-react'
import { Controller } from 'react-hook-form'

import { DatePicker } from '@/components/ui/date-picker'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
    <div className="flex w-full flex-col">
      <div className="relative">
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="absolute right-2 top-1/2 size-4 -translate-y-1/2 cursor-help text-muted-foreground hover:text-foreground" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>O intervalo entre as datas deve ser de no máximo 5 horas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {errors[name] && (
        <span className="mt-1 text-sm text-red-500">
          {errors[name]?.message}
        </span>
      )}
    </div>
  )
}
