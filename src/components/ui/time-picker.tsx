import { Clock } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

const hours = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, '0'),
)
const minutes = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, '0'),
)

interface TimePickerProps {
  value?: Date | null
  defaultValue?: Date | null
  onChangeHourValue: (value: string) => void
  onChangeMinuteValue: (value: string) => void
}

export function TimePicker({
  value,
  defaultValue,
  onChangeHourValue,
  onChangeMinuteValue,
}: TimePickerProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      <div className="flex flex-col items-center">
        <span className="text-sm text-muted-foreground">Hora</span>
        <Select
          defaultValue={defaultValue?.getHours().toString().padStart(2, '0')}
          value={value?.getHours().toString().padStart(2, '0')}
          onValueChange={onChangeHourValue}
        >
          <SelectTrigger className="h-9 w-16">
            <SelectValue placeholder="--" />
          </SelectTrigger>
          <SelectContent className="h-72 w-16 min-w-0">
            {hours.map((item) => (
              <SelectItem className="w-16 min-w-0" value={item}>
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
          value={value?.getMinutes().toString().padStart(2, '0')}
          onValueChange={onChangeMinuteValue}
        >
          <SelectTrigger className="h-9 w-16">
            <SelectValue placeholder="--" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((item) => (
              <SelectItem value={item}>{item}</SelectItem>
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
