'use client'

import '@/utils/date-extensions'

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
  onChange: (props: DateRange | undefined) => void
  defaultValue?: DateRange | undefined
  value: DateRange | undefined
  placeholder?: string
  fromDate?: Date
  toDate?: Date
  defaultMonth?: number
  timePicker?: boolean
}

export function DatePickerWithRange({
  className,
  onChange,
  defaultValue,
  placeholder,
  fromDate,
  toDate,
  defaultMonth,
  value,
  timePicker = true,
}: DatePickerWithRangeProps) {
  const initialMonth = new Date(2024, defaultMonth || new Date().getMonth(), 1)

  function onSelect(newDateRange: DateRange | undefined) {
    const from = newDateRange?.from ? new Date(newDateRange.from) : null
    const to = newDateRange?.to ? new Date(newDateRange.to) : undefined

    if (timePicker) {
      // Preserva hora e minuto selecionados
      if (from) {
        const oldHoursFrom = value?.from ? value.from.getHours() : 0
        const oldMinutesFrom = value?.from ? value.from.getMinutes() : 0

        from.setHours(oldHoursFrom)
        from.setMinutes(oldMinutesFrom)
      }

      if (to) {
        const oldHoursTo = value?.to ? value.to.getHours() : 0
        const oldMinutesTo = value?.to ? value.to.getMinutes() : 0

        to.setHours(oldHoursTo)
        to.setMinutes(oldMinutesTo)
      }
    } else {
      // Seta hora mínima (from) e máxima (to)
      if (from) {
        from.setMinTime()
      }

      if (to) {
        if (to.setMinTime().getTime() === new Date().setMinTime().getTime()) {
          to.setCurrentTime()
        } else {
          to.setMaxTime()
        }
      }
    }
    onChange({
      from,
      to,
    })
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(
                    value.from,
                    timePicker ? 'dd MMM, y HH:mm' : 'dd MMM, y',
                    {
                      locale: ptBR,
                    },
                  )}{' '}
                  -{' '}
                  {format(
                    value.to,
                    timePicker ? 'dd MMM, y HH:mm' : 'dd MMM, y',
                    {
                      locale: ptBR,
                    },
                  )}
                </>
              ) : (
                format(
                  value.from,
                  timePicker ? 'dd MMM, y HH:mm' : 'dd MMM, y',
                  {
                    locale: ptBR,
                  },
                )
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
            selected={value}
            fromDate={fromDate}
            toDate={toDate}
            onSelect={onSelect}
            locale={ptBR}
            numberOfMonths={2}
          />
          {timePicker && (
            <>
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
                    onChange={(newDate) => {
                      onChange({
                        from: newDate,
                        to: value?.to,
                      })
                    }}
                    disabled={!value?.from}
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
                    disabled={!value?.to}
                    onChange={(newDate) => {
                      onChange({
                        from: value?.from || null,
                        to: newDate,
                      })
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
