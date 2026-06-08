'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { dateConfig } from '@/lib/date-config'
import { cn } from '@/lib/utils'

import styles from '../list/components/filter/tickets-general-list-filters.module.css'

function parseDateString(s: string): Date | undefined {
  if (!s?.trim()) return undefined
  const trimmed = s.trim()
  const datePart = trimmed.includes('T') ? trimmed.slice(0, 10) : trimmed
  const d = new Date(`${datePart}T00:00:00`)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatTrigger(d: Date | undefined): string | null {
  if (!d) return null
  return format(d, dateConfig.formats.date, { locale: dateConfig.locale })
}

export type FilterDateRangeFieldProps = {
  startValue: string
  endValue: string
  onChangeStart: (value: string) => void
  onChangeEnd: (value: string) => void
  /** z-index do popover (ex.: modal de filtros vs. dialog de serviço) */
  popoverContentClassName?: string
  disabled?: boolean
}

/** Dois calendários em modo single evitam bugs de pointer-events / RemoveScroll com range em Popover sobre página rolável. */
export function FilterDateRangeField({
  startValue,
  endValue,
  onChangeStart,
  onChangeEnd,
  popoverContentClassName = 'z-[100] w-auto p-0',
  disabled = false,
}: FilterDateRangeFieldProps) {
  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)

  const startDate = useMemo(() => parseDateString(startValue), [startValue])
  const endDate = useMemo(() => parseDateString(endValue), [endValue])

  const defaultMonthStart = startDate ?? endDate ?? new Date()
  const defaultMonthEnd = endDate ?? startDate ?? new Date()

  const triggerClass = cn(
    'h-[42px] w-full justify-between text-left font-normal',
    styles.dateRangeTrigger,
  )

  const handleSelectStart = (d: Date | undefined) => {
    if (!d) {
      onChangeStart('')
      return
    }
    const ymd = toDateString(d)
    onChangeStart(ymd)
    if (endDate && endDate < d) {
      onChangeEnd(ymd)
    }
    setOpenStart(false)
  }

  const handleSelectEnd = (d: Date | undefined) => {
    if (!d) {
      onChangeEnd('')
      return
    }
    const ymd = toDateString(d)
    const nextStart = startDate && startDate <= d ? startDate : d
    onChangeStart(toDateString(nextStart))
    onChangeEnd(ymd)
    setOpenEnd(false)
  }

  return (
    <div
      className={cn(
        styles.dateRangePickerWrap,
        'grid w-full grid-cols-1 gap-2 sm:grid-cols-2',
      )}
    >
      <Popover
        open={disabled ? false : openStart}
        onOpenChange={(o) => {
          if (disabled) return
          setOpenStart(o)
          if (o) setOpenEnd(false)
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={triggerClass}
            aria-label="Data inicial do período"
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {formatTrigger(startDate) ?? 'Início · dd/mm/aaaa'}
            </span>
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={popoverContentClassName}
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={handleSelectStart}
            locale={dateConfig.locale}
            defaultMonth={defaultMonthStart}
            initialFocus
            className="rounded-lg border"
          />
        </PopoverContent>
      </Popover>

      <Popover
        open={disabled ? false : openEnd}
        onOpenChange={(o) => {
          if (disabled) return
          setOpenEnd(o)
          if (o) setOpenStart(false)
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={triggerClass}
            aria-label="Data final do período"
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {formatTrigger(endDate) ?? 'Fim · dd/mm/aaaa'}
            </span>
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={popoverContentClassName}
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={handleSelectEnd}
            locale={dateConfig.locale}
            defaultMonth={defaultMonthEnd}
            initialFocus
            className="rounded-lg border"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
