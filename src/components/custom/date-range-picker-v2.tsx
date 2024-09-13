import { addDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  className?: string
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  maxDate?: Date
  minDate?: Date
  defaultMonth?: Date
}

export function DateRangePicker({
  className,
  dateRange,
  setDateRange,
  maxDate = new Date('2024-06-01'),
  minDate = new Date('2024-06-01'),
  defaultMonth = new Date('2024-06-01'),
}: DateRangePickerProps) {
  const [fromTime, setFromTime] = React.useState('00:00')
  const [toTime, setToTime] = React.useState('23:59')

  const handleDateRangeSelect = (newDateRange: DateRange | undefined) => {
    if (newDateRange?.from) {
      const [fromHours, fromMinutes] = fromTime.split(':').map(Number)
      newDateRange.from.setHours(fromHours, fromMinutes)
    }
    if (newDateRange?.to) {
      const [toHours, toMinutes] = toTime.split(':').map(Number)
      newDateRange.to.setHours(toHours, toMinutes)
    }
    setDateRange(newDateRange)
  }

  const handleTimeChange = (isFrom: boolean, newTime: string) => {
    if (isFrom) {
      setFromTime(newTime)
    } else {
      setToTime(newTime)
    }

    if (dateRange?.from && isFrom) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const newFrom = new Date(dateRange.from)
      newFrom.setHours(hours, minutes)
      setDateRange({ ...dateRange, from: newFrom })
    } else if (dateRange?.to && !isFrom) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const newTo = new Date(dateRange.to)
      newTo.setHours(hours, minutes)
      setDateRange({ ...dateRange, to: newTo })
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
              'w-[300px] justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd 'de' MMMM 'de' yyyy HH:mm", {
                    locale: ptBR,
                  })}{' '}
                  -{' '}
                  {format(dateRange.to, "dd 'de' MMMM 'de' yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </>
              ) : (
                format(dateRange.from, "dd 'de' MMMM 'de' yyyy HH:mm", {
                  locale: ptBR,
                })
              )
            ) : (
              <span>Selecione um intervalo de datas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={defaultMonth}
            selected={dateRange}
            onSelect={handleDateRangeSelect}
            numberOfMonths={2}
            locale={ptBR}
            fromDate={minDate}
            toDate={maxDate}
          />
          <div className="flex justify-between border-t p-3">
            <div className="flex flex-col">
              <span className="mb-1 text-sm font-medium">De</span>
              <Input
                type="time"
                value={fromTime}
                onChange={(e) => handleTimeChange(true, e.target.value)}
                className="w-24"
              />
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-sm font-medium">Até</span>
              <Input
                type="time"
                value={toTime}
                onChange={(e) => handleTimeChange(false, e.target.value)}
                className="w-24"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
