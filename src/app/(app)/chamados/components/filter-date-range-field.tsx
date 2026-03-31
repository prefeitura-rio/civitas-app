'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { type DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { dateConfig } from '@/lib/date-config'

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

function normalizeRange(range: DateRange | undefined): DateRange | undefined {
  if (!range?.from) return undefined
  const from = new Date(range.from)
  const to = range.to ? new Date(range.to) : undefined
  if (!to) return { from, to: undefined }
  if (from.getTime() > to.getTime()) {
    return { from: to, to: from }
  }
  return { from, to }
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

export function FilterDateRangeField({
  startValue,
  endValue,
  onChangeStart,
  onChangeEnd,
  popoverContentClassName = 'z-[100] w-auto p-0',
  disabled = false,
}: FilterDateRangeFieldProps) {
  const [open, setOpen] = useState(false)
  /** Evita completar intervalo ao fechar após seleção completa (props podem ainda não ter atualizado). */
  const closedAfterFullRangeRef = useRef(false)

  const value: DateRange | undefined = useMemo(() => {
    const from = parseDateString(startValue)
    const to = parseDateString(endValue)
    if (!from) return undefined
    if (!to) return { from, to: undefined }
    if (from.getTime() > to.getTime()) {
      return { from: to, to: from }
    }
    return { from, to }
  }, [startValue, endValue])

  const handleChange = (range: DateRange | undefined) => {
    const normalized = normalizeRange(range)
    if (!normalized?.from) {
      closedAfterFullRangeRef.current = false
      onChangeStart('')
      onChangeEnd('')
      return
    }
    onChangeStart(toDateString(normalized.from))
    onChangeEnd(normalized.to ? toDateString(normalized.to) : '')
    if (normalized.from && normalized.to) {
      closedAfterFullRangeRef.current = true
      setOpen(false)
    } else {
      closedAfterFullRangeRef.current = false
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (disabled) return
    if (next) {
      closedAfterFullRangeRef.current = false
    } else if (!closedAfterFullRangeRef.current) {
      const from = parseDateString(startValue)
      const to = parseDateString(endValue)
      if (from && !to) {
        const day = toDateString(from)
        onChangeStart(day)
        onChangeEnd(day)
      }
    } else {
      closedAfterFullRangeRef.current = false
    }
    setOpen(next)
  }

  const triggerLabel =
    value?.from &&
    (value.to
      ? `${format(value.from, dateConfig.formats.date, { locale: dateConfig.locale })} – ${format(value.to, dateConfig.formats.date, { locale: dateConfig.locale })}`
      : format(value.from, dateConfig.formats.date, {
          locale: dateConfig.locale,
        }))

  return (
    <div className={styles.dateRangePickerWrap}>
      <Popover open={disabled ? false : open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={`h-[42px] w-full justify-between text-left font-normal ${styles.dateRangeTrigger}`}
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {triggerLabel ?? 'dd/mm/aaaa – dd/mm/aaaa'}
            </span>
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={popoverContentClassName} align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={handleChange}
            locale={dateConfig.locale}
            numberOfMonths={2}
            defaultMonth={value?.from}
            className="rounded-lg border"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
