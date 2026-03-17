'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { dateConfig } from '@/lib/date-config'

import styles from '../../ticket-create/ticket-create-form.module.css'

function parseDateTimeString(
  s: string,
): { date: Date; time: string } | undefined {
  if (!s?.trim()) return undefined
  const norm = s.includes('T') ? s : `${s}T00:00:00`
  const parsed = new Date(norm)
  if (Number.isNaN(parsed.getTime())) return undefined

  const time =
    s.includes('T') && s.length >= 16
      ? `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
      : '00:00'

  return { date: parsed, time }
}

function toDateTimeString(d: Date, time: string): string {
  const [h = '0', m = '0'] = time.split(':')
  const y = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(parseInt(h, 10)).padStart(2, '0')
  const min = String(parseInt(m, 10)).padStart(2, '0')

  return `${y}-${month}-${day}T${hour}:${min}`
}

type Props = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  defaultTime?: string
  placeholder?: string
}

export function PeriodDatePickerField({
  value,
  onChange,
  disabled,
  defaultTime = '00:00',
  placeholder = 'Selecione a data',
}: Props) {
  const [open, setOpen] = useState(false)
  const parsed = parseDateTimeString(value)

  const triggerLabel =
    parsed?.date != null
      ? format(parsed.date, dateConfig.formats.date, {
          locale: dateConfig.locale,
        })
      : placeholder

  const handleSelect = (d: Date | undefined) => {
    if (!d) return
    onChange(toDateTimeString(d, parsed?.time ?? defaultTime))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={`h-11 w-full min-w-0 justify-between text-left font-normal ${styles.inputBg}`}
        >
          <span className={!parsed?.date ? 'text-muted-foreground' : ''}>
            {triggerLabel}
          </span>
          <CalendarIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={parsed?.date}
          onSelect={handleSelect}
          locale={dateConfig.locale}
          defaultMonth={parsed?.date}
          className="rounded-lg border"
        />
      </PopoverContent>
    </Popover>
  )
}
