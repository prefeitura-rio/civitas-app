'use client'

import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { dateConfig } from '@/lib/date-config'
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
  /** Só aplica quando `type` é `datetime-local`. Padrão: true (comportamento anterior). */
  timePickerDisableFuture?: boolean
  disabled?: boolean
  placeholder?: string
  popoverContentClassName?: string
  timePickerContentClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onDaySelect?: (date: Date) => void
}

export function DatePicker({
  value,
  onChange,
  className,
  type = 'date',
  fromDate,
  toDate,
  timePickerDisableFuture = true,
  disabled = false,
  placeholder = 'Escolha uma data', // Default placeholder
  popoverContentClassName,
  timePickerContentClassName,
  open,
  onOpenChange,
  onDaySelect,
}: DatePickerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isOpen = open ?? uncontrolledOpen
  const displayFormat =
    type === 'datetime-local' ? 'dd MMM, y HH:mm' : 'dd MMM, y'

  function handleOpenChange(next: boolean) {
    if (open === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  function selectDay(newDate: Date | undefined) {
    if (newDate && value) {
      const newValue = new Date(newDate)
      newValue.setHours(value.getHours())
      newValue.setMinutes(value.getMinutes())
      newValue.setSeconds(value.getSeconds())
      newValue.setMilliseconds(value.getMilliseconds())
      onChange(newValue)
      onDaySelect?.(newValue)
      return
    }
    if (newDate) {
      const newValue = new Date(newDate)
      newValue.setHours(dateConfig.defaultTime.hours)
      newValue.setMinutes(dateConfig.defaultTime.minutes)
      newValue.setSeconds(dateConfig.defaultTime.seconds)
      newValue.setMilliseconds(dateConfig.defaultTime.milliseconds)
      onChange(newValue)
      onDaySelect?.(newValue)
      return
    }
    onChange(newDate)
  }

  return (
    <Popover modal={false} open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
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
            format(value, displayFormat, { locale: dateConfig.locale })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-auto p-0', popoverContentClassName)}>
        <Calendar
          mode="single"
          selected={value}
          fromDate={fromDate}
          toDate={toDate}
          locale={dateConfig.locale}
          onSelect={selectDay}
          initialFocus
          disabled={disabled}
        />
        {type === 'datetime-local' && (
          <>
            <Separator orientation="horizontal" className="" />
            <div className="flex items-center justify-center gap-2">
              <TimePicker
                disableFuture={timePickerDisableFuture}
                value={value}
                defaultValue={value}
                onChange={onChange}
                disabled={!value}
                selectContentClassName={timePickerContentClassName}
              />
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
