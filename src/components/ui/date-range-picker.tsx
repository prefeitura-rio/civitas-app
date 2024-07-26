'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { DateRange } from 'react-day-picker'

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

interface DatePickerWithRangeProps {
  className?: string
  onChangeValue?: (props: DateRange | undefined) => void
  defaultValue?: DateRange | undefined
  value?: DateRange | undefined
  placeholder?: string
  defaultMonth?: number
}

export function DatePickerWithRange({
  className,
  onChangeValue,
  defaultValue,
  placeholder,
  defaultMonth,
  value,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(defaultValue)

  const initialMonth = new Date()
  if (defaultMonth) initialMonth.setMonth(defaultMonth)
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd MMM, y HH:mm', {
                    locale: ptBR,
                  })}{' '}
                  -{' '}
                  {format(date.to, 'dd MMM, y HH:mm', {
                    locale: ptBR,
                  })}
                </>
              ) : (
                format(date.from, 'dd MMM, y HH:mm', {
                  locale: ptBR,
                })
              )
            ) : (
              <span>{placeholder || 'Selecione uma data'}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={initialMonth}
            selected={date}
            fromDate={new Date(2024, 5, 1)}
            toDate={new Date()}
            onSelect={(value) => {
              if (value?.from && !value?.to) {
                setDate({
                  from: value.from,
                  to: value.to,
                })
              } else {
                setDate(value)
              }
              onChangeValue?.(value)
            }}
            locale={ptBR}
            numberOfMonths={2}
          />
          <Separator orientation="horizontal" className="" />
          <div className="grid grid-cols-2 p-2">
            <div className="flex items-center justify-center gap-2">
              <div className="pt-4">
                <span className="text-center tracking-tighter text-muted-foreground">
                  Início:
                </span>
              </div>
              <TimePicker
                value={value?.from}
                defaultValue={defaultValue?.from}
                onChangeHourValue={(val) => {
                  if (date?.from) {
                    const newDate = new Date(date?.from)
                    newDate?.setHours(Number(val))
                    setDate({
                      ...date,
                      from: newDate,
                    })
                    onChangeValue?.({
                      ...date,
                      from: newDate,
                    })
                  }
                }}
                onChangeMinuteValue={(val) => {
                  if (date?.from) {
                    const newDate = new Date(date?.from)
                    newDate?.setMinutes(Number(val))
                    setDate({
                      ...date,
                      from: newDate,
                    })
                    onChangeValue?.({
                      ...date,
                      from: newDate,
                    })
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className="pt-4">
                <span className="text-center tracking-tighter text-muted-foreground">
                  Término:
                </span>
              </div>
              <TimePicker
                value={value?.to}
                disableFuture
                defaultValue={defaultValue?.to}
                onChangeHourValue={(val) => {
                  if (date?.to) {
                    const newDate = new Date(date?.to)
                    newDate?.setHours(Number(val))
                    setDate({
                      ...date,
                      to: newDate,
                    })
                    onChangeValue?.({
                      ...date,
                      to: newDate,
                    })
                  }
                }}
                onChangeMinuteValue={(val) => {
                  if (date?.to) {
                    const newDate = new Date(date?.to)
                    newDate?.setMinutes(Number(val))
                    setDate({
                      ...date,
                      to: newDate,
                    })
                    onChangeValue?.({
                      ...date,
                      to: newDate,
                    })
                  }
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
