import { useCallback, useMemo } from 'react'
import { Controller } from 'react-hook-form'

import { Input } from '@/components/ui/input'

interface InputFieldProps {
  name: 'plate' | 'radarIds'
  label: string
  placeholder: string
  isRadarIds?: boolean
  control: any // eslint-disable-line @typescript-eslint/no-explicit-any
  isSubmitting: boolean
  errors: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function InputField({
  name,
  label,
  placeholder,
  isRadarIds = false,
  control,
  isSubmitting,
  errors,
}: InputFieldProps) {
  const getInputValue = useCallback(
    (fieldValue: string | string[] | undefined) => {
      if (!isRadarIds) return fieldValue
      return Array.isArray(fieldValue) ? fieldValue.join(', ') : ''
    },
    [isRadarIds],
  )

  const handleInputChange = useCallback(
    (value: string, onChange: (value: string | string[]) => void) => {
      if (isRadarIds) {
        const codes = value
          .split(',')
          .map((code) => code.trim())
          .filter(Boolean)
        onChange(codes)
      } else {
        onChange(value)
      }
    },
    [isRadarIds],
  )

  const errorMessage = useMemo(() => errors[name]?.message, [errors, name])

  return (
    <div className="flex w-full flex-col">
      <label className="mb-2 text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            {...field}
            className="w-full"
            placeholder={placeholder}
            disabled={isSubmitting}
            value={getInputValue(field.value)}
            onChange={(e) => handleInputChange(e.target.value, field.onChange)}
          />
        )}
      />
      {errorMessage && (
        <span className="mt-1 text-sm text-red-500">{errorMessage}</span>
      )}
    </div>
  )
}
