'use client'

import { format } from 'date-fns'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { dateConfig } from '@/lib/date-config'

import {
  getMonitoredPlateAuthorityValidUntilCalendarFrom,
  getMonitoredPlateAuthorityValidUntilCalendarTo,
  getMonitoredPlateAuthorityValidUntilMaxDayStart,
  getMonitoredPlateAuthorityValidUntilMaxInstant,
  MONITORED_PLATE_AUTHORITY_VALID_UNTIL_MAX_DAYS,
} from './monitored-plate-authority-link-datetime'

interface MonitoredPlateAuthorityValidUntilPickerProps {
  label: string
  validUntilHint?: string
  value: Date | undefined
  onChange: Dispatch<SetStateAction<Date | undefined>>
  disabled?: boolean
}

export function MonitoredPlateAuthorityValidUntilPicker({
  label,
  validUntilHint: validUntilHintProp,
  value,
  onChange,
  disabled = false,
}: MonitoredPlateAuthorityValidUntilPickerProps) {
  const now = new Date()
  const fromDate = getMonitoredPlateAuthorityValidUntilCalendarFrom(value, now)
  const toDate = getMonitoredPlateAuthorityValidUntilCalendarTo(value, now)

  const lastDay = getMonitoredPlateAuthorityValidUntilMaxDayStart(now)
  const lastDayLabel = format(lastDay, 'dd/MM/yyyy', {
    locale: dateConfig.locale,
  })
  const defaultHint = `A validade pode ser definida até ${lastDayLabel} — no máximo ${MONITORED_PLATE_AUTHORITY_VALID_UNTIL_MAX_DAYS} dias após hoje.`
  const validUntilHint = validUntilHintProp ?? defaultHint

  const handleChange = useCallback(
    (updater: SetStateAction<Date | undefined>) => {
      onChange((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (!next) return undefined
        const max = getMonitoredPlateAuthorityValidUntilMaxInstant(new Date())
        if (next.getTime() > max.getTime()) return new Date(max.getTime())
        return next
      })
    },
    [onChange],
  )

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-foreground">{label}</Label>
      <p className="text-xs leading-snug text-muted-foreground">
        {validUntilHint}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <DatePicker
          type="datetime-local"
          value={value}
          onChange={handleChange}
          fromDate={fromDate}
          toDate={toDate}
          timePickerDisableFuture={false}
          disabled={disabled}
          placeholder="Sem validade"
          className="min-w-0 flex-1"
        />
        {value && !disabled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 shrink-0 font-normal"
            onClick={() => onChange(undefined)}
          >
            Limpar
          </Button>
        ) : null}
      </div>
    </div>
  )
}
