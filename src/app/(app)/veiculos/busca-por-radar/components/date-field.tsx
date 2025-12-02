import { Info } from 'lucide-react'
import type { Control } from 'react-hook-form'

import type { RadarSearchFormData } from '@/app/(app)/veiculos/components/validationSchemas'
import { Tooltip } from '@/components/custom/tooltip'
import { DatePicker } from '@/components/ui/date-picker'

import { DateSelectionTooltipContent } from './date-selection-tooltip-content'
import { FormField } from './form-field'

type DateFieldProps = {
  name: 'startDate' | 'endDate'
  control: Control<RadarSearchFormData>
  isSubmitting: boolean
  minDate: Date
  maxDate: Date
  error?: string
}

export function DateField({
  name,
  control,
  isSubmitting,
  minDate,
  maxDate,
  error,
}: DateFieldProps) {
  const isEndDate = name === 'endDate'

  return (
    <FormField control={control} name={name} error={error}>
      {({ value, onChange }) => (
        <div className="relative w-full">
          <DatePicker
            className="w-full"
            value={value}
            onChange={onChange}
            type="datetime-local"
            disabled={isSubmitting}
            fromDate={minDate}
            toDate={maxDate}
          />
          {isEndDate ? (
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
              <Tooltip side="bottom" render={<DateSelectionTooltipContent />}>
                <Info className="size-4 text-muted-foreground" />
              </Tooltip>
            </div>
          ) : null}
        </div>
      )}
    </FormField>
  )
}
