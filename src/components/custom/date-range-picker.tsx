'use client'

import '@/utils/date-extensions'

import { format } from 'date-fns'
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
import { Separator } from '@/components/ui/separator'
import { dateConfig } from '@/lib/date-config'
import { cn } from '@/lib/utils'

import { TimePicker } from './time-picker'

interface DatePickerWithRangeProps {
  className?: string
  onChange: (props?: DateRange | undefined) => void
  defaultValue?: DateRange
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
  const initialMonth = new Date(
    new Date().getFullYear(),
    defaultMonth ?? new Date().getMonth(),
    1,
  )

  function onSelect(newDateRange: DateRange | undefined) {
    const from =
      newDateRange && newDateRange.from ? new Date(newDateRange.from) : null
    if (from) {
      const to =
        newDateRange && newDateRange?.to ? new Date(newDateRange.to) : undefined

      if (timePicker) {
        // Preserva hora e minuto selecionados ou usa horário padrão (00:00)
        if (from) {
          const oldHoursFrom = value?.from
            ? value.from.getHours()
            : dateConfig.defaultTime.hours
          const oldMinutesFrom = value?.from
            ? value.from.getMinutes()
            : dateConfig.defaultTime.minutes

          from.setHours(oldHoursFrom)
          from.setMinutes(oldMinutesFrom)
        }

        if (to) {
          const oldHoursTo = value?.to
            ? value.to.getHours()
            : dateConfig.defaultTime.hours
          const oldMinutesTo = value?.to
            ? value.to.getMinutes()
            : dateConfig.defaultTime.minutes

          to.setHours(oldHoursTo)
          to.setMinutes(oldMinutesTo)
        }
      } else {
        // Seta hora mínima (from) e máxima (to) usando dateConfig
        if (from) {
          from.setHours(dateConfig.defaultTime.hours)
          from.setMinutes(dateConfig.defaultTime.minutes)
          from.setSeconds(dateConfig.defaultTime.seconds)
          from.setMilliseconds(dateConfig.defaultTime.milliseconds)
        }

        if (to) {
          const today = new Date()
          today.setHours(dateConfig.defaultTime.hours)
          today.setMinutes(dateConfig.defaultTime.minutes)
          today.setSeconds(dateConfig.defaultTime.seconds)
          today.setMilliseconds(dateConfig.defaultTime.milliseconds)

          if (to.getTime() === today.getTime()) {
            // Se é hoje, usa hora atual
            const now = new Date()
            to.setHours(now.getHours())
            to.setMinutes(now.getMinutes())
            to.setSeconds(now.getSeconds())
            to.setMilliseconds(now.getMilliseconds())
          } else {
            // Se não é hoje, usa hora máxima (23:59:59) 
            to.setHours(dateConfig.maxTime.hours)
            to.setMinutes(dateConfig.maxTime.minutes)
            to.setSeconds(dateConfig.maxTime.seconds)
            to.setMilliseconds(dateConfig.maxTime.milliseconds)
          }
        }
      }

      onChange({
        from,
        to,
      })
    } else {
      onChange(undefined)
    }
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
                      locale: dateConfig.locale,
                    },
                  )}{' '}
                  -{' '}
                  {format(
                    value.to,
                    timePicker ? 'dd MMM, y HH:mm' : 'dd MMM, y',
                    {
                      locale: dateConfig.locale,
                    },
                  )}
                </>
              ) : (
                format(
                  value.from,
                  timePicker ? 'dd MMM, y HH:mm' : 'dd MMM, y',
                  {
                    locale: dateConfig.locale,
                  },
                )
              )
            ) : (
              <span>{placeholder || 'Selecione uma data'}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={initialMonth}
            selected={value}
            fromDate={fromDate}
            toDate={toDate}
            onSelect={onSelect}
            locale={dateConfig.locale}
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
                      if (newDate) {
                        onChange({
                          from: newDate,
                          to: value ? value.to : undefined,
                        })
                      } else {
                        onChange(undefined)
                      }
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
                      if (value && value.from) {
                        onChange({
                          from: value.from,
                          to: newDate,
                        })
                      }
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
