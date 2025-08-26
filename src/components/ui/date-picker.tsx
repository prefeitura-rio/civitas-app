'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { TimePicker } from '../custom/time-picker'
import { Separator } from './separator'

interface DatePickerProps {
  value: Date | undefined
  onChange: React.Dispatch<React.SetStateAction<Date | undefined>>
  type?: 'date' | 'datetime-local'
  className?: string
  fromDate?: Date
  toDate?: Date
  disabled?: boolean
  placeholder?: string
}

export function DatePicker({
  value,
  onChange,
  className,
  type = 'date',
  fromDate,
  toDate,
  disabled = false,
  placeholder = 'Escolha uma data', // Default placeholder
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" />
          {value ? (
            format(value, 'dd MMM, y HH:mm', { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          fromDate={fromDate}
          toDate={toDate}
          locale={ptBR}
          onSelect={(newDate) => {
            if (newDate && value) {
              // Create new date preserving the time from the original value
              const newValue = new Date(newDate)
              newValue.setHours(value.getHours())
              newValue.setMinutes(value.getMinutes())
              newValue.setSeconds(value.getSeconds())
              newValue.setMilliseconds(value.getMilliseconds())
              onChange(newValue)
            } else {
              onChange(newDate)
            }
          }}
          initialFocus
          disabled={disabled}
        />
        {type === 'datetime-local' && (
          <>
            <Separator orientation="horizontal" className="" />
            <div className="flex items-center justify-center gap-2">
              <TimePicker
                disableFuture
                value={value}
                defaultValue={value}
                onChange={onChange}
                disabled={!value}
              />
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
