import { Controller } from 'react-hook-form'

import { DatePicker } from '@/components/ui/date-picker'

interface DateFieldProps {
  name: 'startDate' | 'endDate'
  label: string
  showValidation?: boolean
  control: any // eslint-disable-line @typescript-eslint/no-explicit-any
  isSubmitting: boolean
  errors: any // eslint-disable-line @typescript-eslint/no-explicit-any
  timeValidation?: {
    isValid: boolean
    message: string
    duration: number
  }
  minDate: Date
  maxDate: Date
}

export function DateField({
  name,
  label,
  showValidation = false,
  control,
  isSubmitting,
  errors,
  timeValidation,
  minDate,
  maxDate,
}: DateFieldProps) {
  return (
    <div className="flex w-full flex-col">
      <label className="mb-2 text-sm font-medium text-muted-foreground">
        {label}
      </label>
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
      {errors[name] && (
        <span className="mt-1 text-sm text-red-500">
          {errors[name]?.message}
        </span>
      )}
      {showValidation && timeValidation && (
        <div
          className={`mt-1 text-sm ${
            timeValidation.isValid ? 'text-blue-600' : 'text-red-500'
          }`}
        >
          {timeValidation.message}
        </div>
      )}
    </div>
  )
}
