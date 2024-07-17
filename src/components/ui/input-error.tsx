import React from 'react'

import { cn } from '@/lib/utils'

interface InputErrorProps {
  className?: string
  message: string | undefined
}

export function InputError({ message, className }: InputErrorProps) {
  return (
    <span className={cn('h-4 text-xs text-destructive', className)}>
      {message}
    </span>
  )
}
