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
import { cn } from '@/lib/utils'

import { Separator } from './separator'
import { TimePicker } from './time-picker'

interface DatePickerProps {
  date: Date | undefined
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>> | undefined
  type?: 'date' | 'datetime-local'
  className?: string
  fromDate?: Date
  toDate?: Date
  disabled?: boolean
}

export function DatePicker({
  date,
  setDate,
  className,
  type = 'date',
  fromDate,
  toDate,
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, 'dd MMM, y HH:mm')
          ) : (
            <span>Escolha uma data</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          fromDate={fromDate}
          toDate={toDate}
          initialFocus
          disabled={disabled}
        />
        {type === 'datetime-local' && (
          <>
            <Separator orientation="horizontal" className="" />
            <div className="flex items-center justify-center gap-2">
              <TimePicker
                disableFuture
                value={date}
                defaultValue={date}
                onChangeHourValue={(val) => {
                  if (date) {
                    const newDate = new Date(date)
                    newDate.setHours(Number(val))
                    setDate?.(newDate)
                  }
                }}
                onChangeMinuteValue={(val) => {
                  if (date) {
                    const newDate = new Date(date)
                    newDate.setMinutes(Number(val))
                    setDate?.(newDate)
                  }
                }}
              />
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
