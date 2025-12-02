import type { Control } from 'react-hook-form'

import type { RadarSearchFormData } from '@/app/(app)/veiculos/components/validationSchemas'
import { Input } from '@/components/ui/input'

import { FormField } from './form-field'

type InputFieldProps = {
  name: 'plate' | 'radarIds'
  placeholder: string
  control: Control<RadarSearchFormData>
  isSubmitting: boolean
  error?: string
  isRadarIds?: boolean
}

export function InputField({
  name,
  placeholder,
  control,
  isSubmitting,
  error,
  isRadarIds = false,
}: InputFieldProps) {
  const getInputValue = (fieldValue: string | string[] | undefined) => {
    if (!isRadarIds) {
      return fieldValue ?? ''
    }

    return Array.isArray(fieldValue) ? fieldValue.join(', ') : ''
  }

  const handleInputChange = (
    value: string,
    onChange: (nextValue: string | string[]) => void,
  ) => {
    if (isRadarIds) {
      const codes = value
        .split(',')
        .map((code) => code.trim())
        .filter(Boolean)

      onChange(codes)
      return
    }

    onChange(value)
  }

  return (
    <FormField control={control} name={name} error={error}>
      {({ value, onChange, ...field }) => (
        <Input
          {...field}
          className="w-full"
          placeholder={placeholder}
          disabled={isSubmitting}
          value={getInputValue(value)}
          onChange={(event) => handleInputChange(event.target.value, onChange)}
        />
      )}
    </FormField>
  )
}
