import { Clock } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

const hours = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, '0'),
)
const minutes = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, '0'),
)

interface TimePickerProps {
  value: Date | null | undefined
  defaultValue?: Date | null
  onChange: (date: Date) => void
  disableFuture?: boolean
  disabled?: boolean
}

export function TimePicker({
  value,
  defaultValue,
  onChange,
  disabled = false,
  disableFuture = false,
}: TimePickerProps) {
  const today = new Date()
  const todayAtMidnight = new Date()
  todayAtMidnight?.setHours(0)
  todayAtMidnight?.setMinutes(0)
  todayAtMidnight?.setSeconds(0)
  todayAtMidnight?.setMilliseconds(0)
  const isValueToday = (value?.getTime() || 0) >= todayAtMidnight?.getTime()

  function shouldDisableHour(item: string) {
    if (!disableFuture || !isValueToday) return false
    if (Number(item) > today.getHours()) return true
    if (item === '0' && today.getHours() === 23) return true
  }

  function shouldDisableMinute(item: string) {
    if (!disableFuture || !isValueToday) return false
    if (value?.getHours() !== today.getHours()) return false

    if (Number(item) > today.getMinutes()) return true
    if (item === '0' && today.getMinutes() === 59) return true
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <div className="flex flex-col items-center">
        <span className="text-sm text-muted-foreground">Hora</span>
        <Select
          defaultValue={defaultValue?.getHours().toString().padStart(2, '0')}
          value={value ? value.getHours().toString().padStart(2, '0') : ''}
          disabled={disabled}
          onValueChange={(val) => {
            if (value) {
              const newDate = new Date(value)
              newDate.setHours(Number(val))
              onChange(newDate)
            }
          }}
        >
          <SelectTrigger className="h-9 w-16">
            <SelectValue placeholder="--" />
          </SelectTrigger>
          <SelectContent className="h-72 w-16 min-w-0">
            {hours.map((item, index) => (
              <SelectItem
                key={index}
                className="w-16 min-w-0"
                value={item}
                disabled={shouldDisableHour(item)}
              >
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-sm text-muted-foreground">Minuto</span>
        <Select
          defaultValue={defaultValue?.getMinutes().toString().padStart(2, '0')}
          value={value ? value.getMinutes().toString().padStart(2, '0') : ''}
          disabled={disabled}
          onValueChange={(val) => {
            if (value) {
              const newDate = new Date(value)
              newDate.setMinutes(Number(val))
              onChange(newDate)
            }
          }}
        >
          <SelectTrigger className="h-9 w-16">
            <SelectValue placeholder="--" />
          </SelectTrigger>
          <SelectContent className="w-16 min-w-0">
            {minutes.map((item, index) => (
              <SelectItem
                key={index}
                className="w-16 min-w-0"
                value={item}
                disabled={shouldDisableMinute(item)}
              >
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pl-1 pt-5">
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}
