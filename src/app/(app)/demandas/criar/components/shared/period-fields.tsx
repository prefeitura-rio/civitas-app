import type { SetStateAction } from 'react'

import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'

import styles from '../../ticket-create/ticket-create-form.module.css'

type BaseProps = {
  startValue: string
  endValue: string
  onChangeStart: (value: string) => void
  onChangeEnd: (value: string) => void
  disabled?: boolean
}

function stringToDateValue(value: string | null | undefined): Date | undefined {
  if (!value?.trim()) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function datePickerValueToIso(
  value: SetStateAction<Date | undefined>,
  previousValue: string,
): string {
  const previousDate = stringToDateValue(previousValue)
  const nextDate = typeof value === 'function' ? value(previousDate) : value
  if (!nextDate || Number.isNaN(nextDate.getTime())) return ''
  return nextDate.toISOString()
}

function SearchPeriodDateTimeFields({
  startValue,
  endValue,
  onChangeStart,
  onChangeEnd,
  disabled = false,
}: BaseProps) {
  const startDate = stringToDateValue(startValue)
  const endDate = stringToDateValue(endValue)

  return (
    <div className="w-full min-w-0 space-y-1.5">
      <Label className={styles.fieldLabel}>Período da busca</Label>
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
        <DatePicker
          type="datetime-local"
          className={styles.servicePeriodDateTimeInput}
          value={startDate}
          onChange={(value) => {
            const nextStart = datePickerValueToIso(value, startValue)
            let nextEnd = endValue
            if (
              nextStart &&
              nextEnd &&
              new Date(nextEnd) < new Date(nextStart)
            ) {
              nextEnd = nextStart
            }
            onChangeStart(nextStart)
            if (nextEnd !== endValue) onChangeEnd(nextEnd)
          }}
          toDate={endDate}
          timePickerDisableFuture={false}
          disabled={disabled}
          placeholder="Início"
          popoverContentClassName="z-[120]"
          timePickerContentClassName="z-[140]"
        />
        <DatePicker
          type="datetime-local"
          className={styles.servicePeriodDateTimeInput}
          value={endDate}
          onChange={(value) => {
            const nextEnd = datePickerValueToIso(value, endValue)
            let nextStart = startValue
            if (
              nextStart &&
              nextEnd &&
              new Date(nextEnd) < new Date(nextStart)
            ) {
              nextStart = nextEnd
            }
            if (nextStart !== startValue) onChangeStart(nextStart)
            onChangeEnd(nextEnd)
          }}
          fromDate={startDate}
          timePickerDisableFuture={false}
          disabled={disabled}
          placeholder="Fim"
          popoverContentClassName="z-[120]"
          timePickerContentClassName="z-[140]"
        />
      </div>
    </div>
  )
}

export function PeriodFields({
  startValue,
  endValue,
  onChangeStart,
  onChangeEnd,
  disabled = false,
}: BaseProps) {
  return (
    <SearchPeriodDateTimeFields
      startValue={startValue}
      endValue={endValue}
      onChangeStart={onChangeStart}
      onChangeEnd={onChangeEnd}
      disabled={disabled}
    />
  )
}

export function PeriodFieldsCalendarStyle({
  startValue,
  endValue,
  onChangeStart,
  onChangeEnd,
  disabled = false,
}: BaseProps) {
  return (
    <SearchPeriodDateTimeFields
      startValue={startValue}
      endValue={endValue}
      onChangeStart={onChangeStart}
      onChangeEnd={onChangeEnd}
      disabled={disabled}
    />
  )
}
