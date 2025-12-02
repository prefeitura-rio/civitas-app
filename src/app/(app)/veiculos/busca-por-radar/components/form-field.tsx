import type { ReactNode } from 'react'
import {
  type Control,
  Controller,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { InputError } from '@/components/custom/input-error'
import { cn } from '@/lib/utils'

interface FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>
  name: TName
  className?: string
  error?: string
  children: (field: ControllerRenderProps<TFieldValues, TName>) => ReactNode
}

export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  className,
  error,
  children,
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <div className={cn('flex w-full flex-col', className)}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <>{children(field)}</>}
      />
      {error ? <InputError message={error} /> : null}
    </div>
  )
}
