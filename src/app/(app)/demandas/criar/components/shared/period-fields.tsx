import { FilterDateRangeField } from '@/app/(app)/demandas/components/filter-date-range-field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import styles from '../../ticket-create/ticket-create-form.module.css'

type BaseProps = {
  startValue: string
  endValue: string
  onChangeStart: (value: string) => void
  onChangeEnd: (value: string) => void
  disabled?: boolean
}

export function PeriodFields({
  startValue,
  endValue,
  onChangeStart,
  onChangeEnd,
  disabled = false,
}: BaseProps) {
  return (
    <div className="w-full min-w-0 space-y-1.5">
      <Label className={styles.fieldLabel}>Período da busca</Label>
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          className={`h-11 min-w-0 ${styles.inputBg}`}
          type="datetime-local"
          value={startValue}
          onChange={(e) => onChangeStart(e.target.value)}
          disabled={disabled}
        />
        <Input
          className={`h-11 min-w-0 ${styles.inputBg}`}
          type="datetime-local"
          value={endValue}
          onChange={(e) => onChangeEnd(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
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
    <div className="w-full min-w-0 space-y-1.5">
      <Label className={styles.fieldLabel}>Período da busca</Label>
      <FilterDateRangeField
        startValue={startValue}
        endValue={endValue}
        onChangeStart={onChangeStart}
        onChangeEnd={onChangeEnd}
        popoverContentClassName="z-[120] w-auto p-0"
        disabled={disabled}
      />
    </div>
  )
}
