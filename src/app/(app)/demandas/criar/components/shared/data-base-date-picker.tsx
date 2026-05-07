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

function parseDateString(s: string): Date | undefined {
  if (!s?.trim()) return undefined
  const d = new Date(`${s}T00:00:00`)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

type Props = {
  value: string
  onChange: (value: string | null) => void
  disabled?: boolean
}

export function DataBaseDatePicker({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const date = parseDateString(value)

  const triggerLabel = date
    ? format(date, dateConfig.formats.date, { locale: dateConfig.locale })
    : ''

  const handleSelect = (d: Date | undefined) => {
    if (!d) {
      onChange(null)
      return
    }

    onChange(toDateString(d))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={`h-11 w-full justify-between text-left font-normal ${styles.inputBg}`}
        >
          <span>{triggerLabel}</span>
          <CalendarIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          locale={dateConfig.locale}
          defaultMonth={date}
          className="rounded-lg border"
        />
      </PopoverContent>
    </Popover>
  )
}
