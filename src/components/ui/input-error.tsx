import React from 'react'

interface InputErrorProps {
  message: string | undefined
}

export function InputError({ message }: InputErrorProps) {
  return <span className="h-4 text-xs text-destructive">{message}</span>
}
