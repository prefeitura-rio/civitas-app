import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import styles from '../../ticket-create/ticket-create-form.module.css'
import { PeriodDatePickerField } from './period-date-picker-field'

type BaseProps = {
  startValue: string
  endValue: string
  onChangeStart: (value: string) => void
  onChangeEnd: (value: string) => void
}

export function PeriodFields({
  startValue,
  endValue,
  onChangeStart,
  onChangeEnd,
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
        />
        <Input
          className={`h-11 min-w-0 ${styles.inputBg}`}
          type="datetime-local"
          value={endValue}
          onChange={(e) => onChangeEnd(e.target.value)}
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
}: BaseProps) {
  return (
    <div className="w-full min-w-0 space-y-1.5">
      <Label className={styles.fieldLabel}>Período da busca</Label>
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
        <div className="min-w-0">
          <PeriodDatePickerField
            value={startValue}
            onChange={onChangeStart}
            defaultTime="00:00"
            placeholder="Data inicial"
          />
        </div>
        <div className="min-w-0">
          <PeriodDatePickerField
            value={endValue}
            onChange={onChangeEnd}
            defaultTime="23:59"
            placeholder="Data final"
          />
        </div>
      </div>
    </div>
  )
}
